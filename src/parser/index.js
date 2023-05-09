import { csv } from 'd3';
import { bool, element } from 'prop-types';
import csvData from './sample proteins_2023_02_26.csv';
// import csvData from './Formatted N-Glyco_ss_human.csv';

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
    protein.value = el['Entry'];
    protein.label = el['Entry name'];
    protein.description = el['Protein names'];
    protein.rawDSBdata = el['Disulfide bond']
    protein.disulfideBonds = arrayStrConversion(el['Disulfide bond']);
    protein.rawGLYdata = el.Glycosylation
    protein.glycoslation = arrayStrConversion(el.Glycosylation);
    protein.length = parseInt(el.Length, 10);
    protein.topology = el['topology'];
    
    const domain = parseSequence(protein.topology, protein.length)
    protein.outsideDomain = domain.o
    protein.insideDomain = domain.i
    protein.rawSEQdata = el['Sequon list']

    let sequons = arrayStrConversion(el['Sequon list'])
    protein.sequons = findFreeSequons(sequons, protein.glycoslation)
    protein.rawCYSdata = el['Cysteine positions']
    
    let cysteines = arrayStrConversion(el['Cysteine positions'])
    cysteines = fixPosOffset(cysteines)
    protein.cysteines = findFreeCys(cysteines, protein.disulfideBonds)
    
    proteinsData.push(protein);
  });
  
  let sequonConflictEntries = findSequonConflictEntries(proteinsData)
  let cysConflictEntries = findCysConflictEntries(proteinsData)
  let glycoConflictEntries = findGlycoConflictEntries(proteinsData)
  let dsbConflictEntries = findDSBConflictEntries(proteinsData)
  let finalConflictEntries = mergeConflictEntries(proteins, sequonConflictEntries, cysConflictEntries, glycoConflictEntries, dsbConflictEntries)
  console.log(finalConflictEntries)
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

function mergeConflictEntries(proteins, seqEntries, cysEntries, glycoEntries, dsbEntries){
  let entries = []
  seqEntries.forEach(element => {
    entries.push(element)
  });

  cysEntries.forEach(element =>{
    let inEntries = false
    for(let i = 0; i < entries.length; i++){
      if(element == entries[i]){
        inEntries = true
      }
    }

    if(inEntries == false){
      entries.push(element)
    }
  })

  glycoEntries.forEach(element =>{
    let inEntries = false
    for(let i = 0; i < entries.length; i++){
      if(element == entries[i]){
        inEntries = true
      }
    }

    if(inEntries == false){
      entries.push(element)
    }
  })
  
  dsbEntries.forEach(element =>{
    let inEntries = false
    for(let i = 0; i < entries.length; i++){
      if(element == entries[i]){
        inEntries = true
      }
    }

    if(inEntries == false){
      entries.push(element)
    }
  })

  let entriesJSON = []
  //convert entries into JSON
  entries.forEach(entry =>{
    let prot;
    loop: for(let i = 0; i < proteins.length; i++){
      if(entry.value == proteins[i].value){
        prot = proteins[i]
        break loop
      }
    }

    let obj = {
      "Entry": entry.value,
      "Entry name": entry.label,
      "Protein names": entry.description,
      "Disulfide bond": entry.rawDSBdata, //entry.disulfideBonds
      "Disulfide bond Conflicts": entry.dsbConflictPos,
      "Glycosylation": entry.rawGLYdata,
      "Glycosylation Conflicts": entry.glycoConflictPos,
      "Length": entry.length,
      "topology": entry.topology,
      "Cysteine positions": entry.rawCYSdata,//prot['Cysteine positions']
      "Cysteine Conflicts": entry.cysConflictPos,
      "Sequon list": entry.rawSEQdata,//prot['Sequon list']
      "Sequon Conflicts": entry.seqConflictPos
    }
    entriesJSON.push(obj)
  })

  return JSON.stringify(entriesJSON)
}

function findSequonConflictEntries(proteins){
  let entries = []

  proteins.forEach(protein => {
    let start_position = protein.outsideDomain.map(obj => obj.start_pos)
    let end_position = protein.outsideDomain.map(obj => obj.end_pos)
    let seq = protein.sequons.map(el => parseInt(el, 10));
    let inODomain = false
    let conflictPos = []
    for(let i = 0; i < seq.length; i++){
      inODomain = false;
      for(let j = 0; j < start_position.length; j++){
        if(seq[i] >= start_position[j] && seq[i] <= end_position[j]){
          inODomain = true
        }
      }
      if(inODomain == false){
        let str = `${seq[i]}`
        conflictPos.push(str)
      }
    }

    if(conflictPos.length != 0){
      protein.seqConflictPos = JSON.stringify(conflictPos)
      entries.push(protein)
    }
  })
    
  return entries;
}

function findCysConflictEntries(proteins){
  let entries = []

  proteins.forEach(protein => {
    let start_position = protein.outsideDomain.map(obj => obj.start_pos)
    let end_position = protein.outsideDomain.map(obj => obj.end_pos)
    let cys = protein.cysteines.map(el => parseInt(el, 10))
    let inODomain = false
    let conflictPos = []
    for(let i = 0; i < cys.length; i++){
      inODomain = false;
      for(let j = 0; j < start_position.length; j++){
        if(cys[i] >= start_position[j] && cys[i] <= end_position[j]){
          inODomain = true
        }
      }
      if(inODomain == false){
        let str = `${cys[i]}`
        conflictPos.push(str)
      }
    }

    if(conflictPos.length != 0){
      protein.cysConflictPos = JSON.stringify(conflictPos)
      entries.push(protein)
    }
  })
    
  return entries;
}

function findGlycoConflictEntries(proteins){
  let entries = []

  proteins.forEach(protein => {
    let start_position = protein.outsideDomain.map(obj => obj.start_pos)
    let end_position = protein.outsideDomain.map(obj => obj.end_pos)
    let glyco = protein.glycoslation.map(el => parseInt(el, 10));
    let inODomain = false
    let conflictPos = []
    for(let i = 0; i < glyco.length; i++){
      inODomain = false
      for(let j = 0; j < start_position.length; j++){
        if(glyco[i] >= start_position[j] && glyco[i] <= end_position[j]){
          inODomain = true
        }
      }
      if(inODomain == false){
        let str = `${glyco[i]}`
        conflictPos.push(str)
      }
    }
    if(conflictPos.length != 0){
      protein.glycoConflictPos = JSON.stringify(conflictPos)
      entries.push(protein)
    }
  })
    
  return entries;
}

function findDSBConflictEntries(proteins){
  let entries = []

  proteins.forEach(protein => {
    let start_position = protein.outsideDomain.map(obj => obj.start_pos)
    let end_position = protein.outsideDomain.map(obj => obj.end_pos)
    
    let bonds = protein.disulfideBonds.map(pair => {
      const bondPos = [];
      const atoms = pair.split(' ');
      atoms.forEach(el => {
        const atom = parseInt(el, 10);
        bondPos.push(atom);
      });
      return bondPos;
    });

    let inODomain = false
    let conflictPos = []
    for(let i = 0; i < bonds.length; i++){
      inODomain = false
      for(let j = 0; j < start_position.length; j++){
        if(bonds[i][0] >= start_position[j] && bonds[i][0] <= end_position[j]){//dsb startPos
          if(bonds[i][1] >= start_position[j] && bonds[i][1] <= end_position[j]){//dsb endPos
            inODomain = true
          }
        }
      }
      if(protein.disulfideBonds.length != 0 && inODomain == false){
        let str = `${bonds[i]}`
        conflictPos.push(str)
      }
    }

    if(conflictPos.length != 0){
      protein.dsbConflictPos = JSON.stringify(conflictPos)
      entries.push(protein)
    }
  })
    
  return entries;
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