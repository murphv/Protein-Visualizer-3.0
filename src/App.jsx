import React, { useState, useEffect } from 'react';
import { StylesProvider } from '@material-ui/core';
import html2canvas from 'html2canvas';
import {Canvg} from "canvg";
import { csv } from 'd3';
import { jsPDF } from 'jspdf';
import Dropdown from './components/Dropdown';
import Visualization from './components/Visualization';
import CustomAppBar from './components/AppBar';
import Introduction from './components/Introduction';
import './App.scss';
import SearchBar from './components/ProteinSearchBar';
import parser from './parser';
import csvData from './parser/human_protein_full_list.csv';

const { getProteins } = parser;
// one-time command to setup and activate the virtual environemnt script: ./venv/Scripts/activate
const { innerWidth, innerHeight } = window;

function App() {
  const ToCaptureRef = React.useRef();
  const [currSelection, updateSelection] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [scaleVisualization, setScaleVisualization] = useState(false);
  const [isLegendOpen, setLegendState] = useState(true);
  const [proteinOpts, setProteinOpts] = useState([]);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [fullScale, setFullScale] = useState(false);
  const [fullScaleDisabled, setFullScaleDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');

  useEffect(() => {
    getProteins().then((proteins) => setProteinOpts(proteins));
  }, []);

  const updateScaleFactor = (val) => {
    setScaleFactor(val);
  };

  const toggleScaling = () => {
    setScaleVisualization(!scaleVisualization);
  };

  const showHome = () => {
    updateSelection(null);
    setShowIntro(true);
  };

  const updateSel = (index) => {
    updateSelection(null);
    setShowIntro(false);
    setTimeout(() => updateSelection(index), 500);
    if (!Number.isInteger(index)) {
      setShowIntro(true);
    }
  };

  function processAPIData(data, topDf, accessionNum) {
    function extractGlycoBonds() {
      const filtered = data.features.filter((x) => x.type === 'Glycosylation');
      const positions = filtered
        .filter(
          (x) =>
            x.description.includes('N-linked') &&
            !x.description.includes('glycation')
        )
        .map((x) => x.location.start);
      if (positions.length != 0) {
        const strPos = positions.map((x) => x.value).join(',');
        return strPos.match(/\d+/g);
      }
      return [];
    }

    function extractDsBonds() {
      const filtered = data.features.filter((x) => x.type === 'Disulfide bond');
      const startPositions = filtered.map((x) => x.location.start);
      const endPositions = filtered.map((x) => x.location.end);
      const startPos = startPositions.map((x) => x.value);
      const endPos = endPositions.map((x) => x.value);
      return startPos.map((start, index) => `${start} ${endPos[index]}`);
    }

    function extractCysteines(dsBonds) {
      const sequence = data.sequence.value;
      const pos = [...sequence.matchAll(/C/g)].map((match) => match.index + 1);
      const totalCys = pos.map((x) => x.toString());

      const freeCys = [];
      const dsList = dsBonds.map((x) => x.split(' '));
      for (const cys of totalCys) {
        let isSame = false;
        for (const ds of dsList) {
          if (ds.includes(cys)) {
            isSame = true;
            break;
          }
        }
        if (!isSame) {
          freeCys.push(cys);
        }
      }
      return [totalCys, freeCys];
    }

    function extractSequons(glycoBonds) {
      const sequence = data.sequence.value;
      const nxtPos = [...sequence.matchAll(/N[A-Z]T/g)].map(
        (match) => match.index + 1
      );
      const nxsPos = [...sequence.matchAll(/N[A-Z]S/g)].map(
        (match) => match.index + 1
      );
      const seqPos = [...nxtPos, ...nxsPos].sort((a, b) => a - b).map(String);
      const freeSeq = seqPos.filter((pos) => !glycoBonds.includes(pos));
      return [seqPos, freeSeq];
    }

    function parseSequence(sequence, length) {
      let newString = '';
      let start;
      let end;
      let outside = [];
      let inside = [];
      let pos = '';
      /* Object template
        {
            start_pos: start,
            end_pos: end
        }
      */

      for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] !== '-') {
          if (sequence[i] === 'o') {
            pos = sequence[i];
            start = newString;
            newString = '';
            if (start == null || start == '') {
              start = 0;
            }
            if (i == sequence.length - 1) {
              //last character scenario
              end = length;
              let entry = {
                start_pos: start,
                end_pos: end
              };
              outside.push(entry);
            }
          } else if (sequence[i] === 'i') {
            pos = sequence[i];
            start = newString;
            newString = '';
            if (start == null || start == '') {
              start = 0;
            }
            if (i == sequence.length - 1) {
              //last character scenario
              end = length;
              let entry = {
                start_pos: start,
                end_pos: end
              };
              inside.push(entry);
            }
          } else {
            newString += sequence[i];
          }
        } else {
          end = newString;
          let entry = {
            start_pos: start,
            end_pos: end
          };
          if (pos === 'o') {
            outside.push(entry);
          } else {
            inside.push(entry);
          }

          newString = '';
        }
      }
      return [outside, inside];
    }

    function getProteinInfo() {
      const entry = topDf.filter(
        (row) => row['Name'] === accessionNum.value
      )[0];
      const domain = parseSequence(entry['Orientation'], entry['Length']);
      const sequons = extractSequons(extractGlycoBonds());
      const cysteines = extractCysteines(extractDsBonds());
      return {
        value: entry['Name'],
        description: entry['Protein name'],
        topology: entry['Orientation'],
        length: entry['Length'],
        outsideDomain: domain[0],
        insideDomain: domain[1],
        glycoslation: extractGlycoBonds(),
        disulfideBonds: extractDsBonds(),
        totalSequons: sequons[0],
        sequons: sequons[1],
        totalCysteines: cysteines[0],
        cysteines: cysteines[1]
      };
    }
    console.log(getProteinInfo());
    return getProteinInfo();
  }

  const updateAccession = async (accessionNum) => {
    const topDf = await csv(csvData);
    let url = 'https://rest.uniprot.org/uniprotkb/' + accessionNum.value;
    const response = await fetch(`${url}?`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accessionNum)
    });
    const data = await response.json();

    try {
      const protein = processAPIData(data, topDf, accessionNum);

      //check if protein is already in the list
      let index = proteinOpts.findIndex((p) => p.value == protein.value);
      if (index > -1) {
        updateSel(index);
      } else {
        if (protein.value !== undefined) {
          proteinOpts.push(protein);
          console.log('Protein added to the list');
          index = proteinOpts.findIndex((p) => p.value == protein.value);
          updateSel(index);
        }
      }
    } catch (error) {
      //catches internal servor errors (most likely from invalid input or if the excel file doesnt contain the number)
      setErrorMessage('Please enter a valid protein accession number');
      updateSel(-1);
    }
  };

  const toggleLegend = () => {
    setLegendState(!isLegendOpen);
  };

  const toggleFullScale = () => {
    setFullScale(!fullScale);
  };

  const captureScreenshot = () => {
    let canvasPromise = html2canvas(ToCaptureRef.current, {
      useCORS: true, // in case you have images stored in your application
      scrollX: -window.scrollX
    });
    canvasPromise.then((canvas) => {
      const image = canvas.toDataURL('image/jpeg', 1.0);
      const doc = new jsPDF('p', 'px', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const widthRatio = pageWidth / canvas.width;
      const heightRatio = pageHeight / canvas.height;
      const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

      const canvasWidth = canvas.width * ratio;
      const canvasHeight = canvas.height * ratio;

      const marginX = (pageWidth - canvasWidth) / 2;
      const marginY = (pageHeight - canvasHeight) / 2;

      doc.addImage(image, 'JPEG', marginX, marginY, canvasWidth, canvasHeight);
      doc.output('dataurlnewwindow');
    });
  };

  const captureFullSVG = () => {
    const htmlStr = document.getElementById('svg').outerHTML;
    const blob = new Blob([htmlStr], { type: 'image/svg+xml' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('download', 'output.svg');
    a.setAttribute('href', url);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const captureWindowSVG = () => {
    const htmlStr = document.getElementById('windowSvg').outerHTML;
    const blob = new Blob([htmlStr], { type: 'image/svg+xml' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('download', 'output.svg');
    a.setAttribute('href', url);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const captureFullImage = async () => {
    const htmlStr = document.getElementById("svg").outerHTML;
    const svg = document.getElementById("svg");
    const bbox = svg.getBBox();

    const canvas = document.createElement('canvas');
    canvas.width = bbox.width;
    canvas.height = bbox.height;

    const ctx = canvas.getContext('2d');
    const v = await Canvg.fromString(ctx, htmlStr);
    await v.render();
    const base64 = canvas.toDataURL("image/png");

    const a = document.createElement('a');
    a.setAttribute('download', 'output.png');
    a.setAttribute('href', base64);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const captureWindowsImage = async () => {
    const htmlStr = document.getElementById("windowSvg").outerHTML;
    const svg = document.getElementById("svg");
    const bbox = svg.getBBox();

    const canvas = document.createElement('canvas');
    canvas.width = bbox.width;
    canvas.height = bbox.height;

    const ctx = canvas.getContext('2d');
    const v = await Canvg.fromString(ctx, htmlStr);
    await v.render();
    const base64 = canvas.toDataURL("image/png");

    const a = document.createElement('a');
    a.setAttribute('download', 'output.png');
    a.setAttribute('href', base64);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const intro = showIntro ? <Introduction /> : null;

  return (
    <StylesProvider injectFirst>
      <div className="App">
        <CustomAppBar
          toggleLegend={toggleLegend}
          scaleVisualization={toggleScaling}
          showHome={showHome}
          captureScreenshot={captureScreenshot}
          captureFullSVG={captureFullSVG}
          captureWindowSVG={captureWindowSVG}
          captureFullImage={captureFullImage}
          captureWindowsImage={captureWindowsImage}
          setScaleFactor={updateScaleFactor}
          toggleFullScale={toggleFullScale}
          disableFullScale={fullScaleDisabled}
          fullScale={fullScale}
        />
        <div className="page-wrap">
          <div className="App-searchbar">
            <SearchBar onSubmit={updateAccession} />
          </div>
          <div className="App-dropdown">
            {proteinOpts.length ? (
              <Dropdown options={proteinOpts} updateSel={updateSel} />
            ) : null}
          </div>
        </div>
        {currSelection == -1 ? (
          <div style={{ marginTop: '1rem', color: 'red' }}>{errorMessage}</div>
        ) : (
          <div />
        )}
        {currSelection != null &&
        currSelection != -1 &&
        Number.isInteger(currSelection) ? (
          <div className="html2canvas-container" ref={ToCaptureRef}>
            <Visualization
              width={innerWidth}
              height={innerHeight}
              currSelection={currSelection}
              isLegendOpen={isLegendOpen}
              initialOptions={proteinOpts}
              scaleFactor={scaleFactor}
              fullScale={fullScale}
              setFullScaleDisabled={setFullScaleDisabled}
            />
          </div>
        ) : (
          <div>{intro}</div>
        )}
      </div>
    </StylesProvider>
  );
}

export default App;
