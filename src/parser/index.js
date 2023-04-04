import { csv } from 'd3';
import { bool } from 'prop-types';
import csvData from './sample proteins_2023_02_26.csv';
// import csvData from './N-Glyco_ss_human.csv';

async function getData() {
  const data = await csv(csvData);
  return data;
}

const arrayStrConversion = str => {
  let newStr = str.replace(/'/g, '"');
  // let finStr = newStr.replace('..', ' '); //remove any .. introduced in the disulfide notation
  const array = JSON.parse(newStr);
  return array;
};

const getProteins = async () => {
  const proteinsData = [];
  const proteins = await getData();
  proteins.forEach(el => {
    const protein = {};
    protein.value = el['Entry name'];
    protein.label = el['Entry name'];
    protein.description = el['Protein names'];
    protein.disulfideBonds = arrayStrConversion(el['Disulfide bond']);
    protein.glycoslation = arrayStrConversion(el.Glycosylation);
    console.log(protein.disulfideBonds)
    protein.length = parseInt(el.Length, 10);
    protein.topology = el['topology'];
    const domain = parseSequence(protein.topology, protein.length)
    protein.outsideDomain = domain.o
    protein.insideDomain = domain.i
    let sequons = arrayStrConversion(el['Sequon list'])
    protein.sequons = findFreeSequons(sequons, protein.glycoslation)
    // console.log(protein.sequons)
    let cysteines = arrayStrConversion(el['Cysteine positions'])
    cysteines = fixPosOffset(cysteines)
    protein.cysteines = findFreeCys(cysteines, protein.disulfideBonds)
    console.log(protein.cysteines)
    
    proteinsData.push(protein);
  });
  return proteinsData;
};

//special function for cysteines to fix the position (off by 1) issue
function fixPosOffset(cysteines){
  let cys = []
  for(let i = 0; i < cysteines.length; i++){
    // console.log(cysteines[i])
    let c = parseInt(cysteines[i]) + 1
    cys.push(c.toString())
    // console.log(`cys value: ${cys[i]}`)
  }
  return cys
}

function findFreeSequons(sequons, glycans){
  let freeSequons = []
  for(let i = 0; i < sequons.length; i++){
    let isSame = false
    for(let j = 0; j < glycans.length; j++){
      if(sequons[i] == glycans[j]){
        isSame = true
      }
    }
    if(!isSame){
      freeSequons.push(sequons[i])
    }
  }
  return freeSequons
}

function findFreeCys(cysteines, sulfides){
  let freeCysteines = []
  for(let i = 0; i < cysteines.length; i++){
    // console.log(`cys value: ${cysteines[i]}`)
    let isSame = false
    for(let j = 0; j < sulfides.length; j++){
      let sulfide = sulfides[j].split(" ")  
      if(cysteines[i] == sulfide[0] || cysteines[i] == sulfide[1]){
        isSame = true
      }
    }
    if(!isSame){
      freeCysteines.push(cysteines[i])
    }
  }
  return freeCysteines
}

function parseSequence (sequence, length){
  let newString = ''
  let start, end
  let outside = []
  let inside = []
  let pos = ''
  /* Object template
    {
        start_pos: start,
        end_pos: end
    }
  */

  for(let i = 0; i < sequence.length; i++){
    if(sequence[i] !== '-'){  
      if(sequence[i] === 'o'){
        pos = sequence[i]
        start = newString
        newString = "";
        if(start == null || start == ''){
          start = 0
        }
        if(i == sequence.length-1){//last character scenario  
          end = length
          let entry = {
            start_pos: start,
            end_pos: end
          }
          outside.push(entry)
        }
      }else if(sequence[i] === 'i'){
        pos = sequence[i]
        start = newString
        newString = "";
        if(start == null || start == ''){
          start = 0
        }
        if(i == sequence.length-1){//last character scenario
          end = length
          let entry = {
            start_pos: start,
            end_pos: end
          }
          inside.push(entry)
        }
      }else{
        newString += sequence[i]
      }
    }else{
      end = newString
      let entry = {
      start_pos: start,
      end_pos: end
      }
      if(pos === 'o'){
        outside.push(entry)
      }else{
        inside.push(entry)
      }
          
      newString = "";
    }
  }

  const domain = {o: outside, i: inside}
  return domain
}

export default { getProteins };