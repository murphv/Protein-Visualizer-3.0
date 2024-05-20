import React, { useState, useEffect } from 'react';
import { StylesProvider } from '@material-ui/core';
import Dropdown from './components/Dropdown';
import Visualization from './components/Visualization';
import CustomAppBar from './components/AppBar';
import Introduction from './components/Introduction';
import './App.scss';
import SearchBar from './components/ProteinSearchBar';
import parser from './parser';

const { getProteins } = parser;
// one-time command to setup and activate the virtual environemnt script: ./venv/Scripts/activate
const { innerWidth, innerHeight } = window;

function App() {
  const [currSelection, updateSelection] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [scaleVisualization, setScaleVisualization] = useState(false);
  const [isLegendOpen, setLegendState] = useState(true);
  const [proteinOpts, setProteinOpts] = useState([]);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [fullScale, setFullScale] = useState(false);
  const [fullScaleDisabled, setFullScaleDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = React.useState('')
  
  useEffect(() => {
    getProteins().then(proteins => setProteinOpts(proteins));
  }, []);

  const updateScaleFactor = val => {
    setScaleFactor(val);
  };

  const toggleScaling = () => {
    setScaleVisualization(!scaleVisualization);
  };

  const showHome = () => {
    updateSelection(null);
    setShowIntro(true);
  }

  const updateSel = index => {
    updateSelection(null);
    setShowIntro(false);
    setTimeout(() => updateSelection(index), 500);
    if (!Number.isInteger(index)) {
      setShowIntro(true);
    }
  };

  //handles all flask backend communication 
  const updateAccession = async (accessionNum) => {

    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(accessionNum)
    })

    try{
      const apiData = await response.json()
      const protein = {}
      protein.value = apiData['Accession Num'];
      protein.label = [];
      protein.description = apiData['Protein Name']
      protein.disulfideBonds = apiData['Disulfide Bonds']
      protein.glycoslation = apiData['Glyco Bonds']
      protein.length = parseInt(apiData['Length'])
      protein.topology = apiData['Orientation'];
      protein.outsideDomain = apiData['outsideDomain']
      protein.insideDomain = apiData['insideDomain']
      protein.totalSequons = apiData['totalSequons']
      protein.sequons = apiData['freeSequons']
      protein.totalCysteines = apiData['totalCysteines']
      protein.cysteines = apiData['freeCysteines']

      console.log(protein)

      //check if protein is already in the list
      var index = proteinOpts.findIndex(p => p.value == protein.value)
      if(index > -1){
        updateSel(index)
      }else{
        if(protein.value !== undefined){
          proteinOpts.push(protein)
          console.log("Protein added to the list")
          index = proteinOpts.findIndex(p => p.value == protein.value)
          updateSel(index)
        }
      }
    }catch(error){//catches internal servor errors (most likely from invalid input or if the excel file doesnt contain the protein)
      setErrorMessage('Please enter a valid protein accession number')
      updateSel(-1)
    }
  }

  const toggleLegend = () => {
    setLegendState(!isLegendOpen);
  };

  const toggleFullScale = () => {
    setFullScale(!fullScale);
  };

  const intro = showIntro ? <Introduction /> : null;

  return (
    <StylesProvider injectFirst>
      <div className="App">
        <CustomAppBar
          toggleLegend={toggleLegend}
          scaleVisualization={toggleScaling}
          showHome={showHome}
          setScaleFactor={updateScaleFactor}
          toggleFullScale={toggleFullScale}
          disableFullScale={fullScaleDisabled}
          fullScale={fullScale}
        />
        <div className='page-wrap'>
          <div className='App-searchbar'>
            <SearchBar onSubmit={updateAccession}></SearchBar>
          </div>
          <div className="App-dropdown">
            {proteinOpts.length ? (
              <Dropdown options={proteinOpts} updateSel={updateSel} />
            ) : null}
          </div>
        </div>
        {currSelection == -1 ? (<div style={{marginTop: '1rem', color:'red'}}>{errorMessage}</div>):(<div/>)}
        {currSelection != null && currSelection != -1 && Number.isInteger(currSelection) ? (
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
        ) : (
          <div>{intro}</div>
        )}
      </div>
    </StylesProvider>
  );
}

export default App;
