import { csv } from 'd3';
import csvData from './sample proteins_2022_10_05.csv';

async function getData() {
  const data = await csv(csvData);
  return data;
}

const arrayStrConversion = str => {
  let newStr = str.replace(/'/g, '"');
  newStr = newStr.replace('..', ' '); //remove any .. introduced in the disulfide notation
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
    protein.disulfideBonds = arrayStrConversion(el['Dislfide bond']);
    protein.glycoslation = arrayStrConversion(el.Glycosylation);
    protein.length = parseInt(el.Length, 10);
    protein.topology = el['topology'];
    const domain = parseSequence(protein.topology, protein.length)
    protein.outsideDomain = domain.o
    protein.insideDomain = domain.i

    // for(let i = 0; i < protein.outsideDomain.length; i++){
    //     console.log(`outside, start_pos: ${protein.outsideDomain[i].start_pos} | end_pos: ${protein.outsideDomain[i].end_pos}`);
    // }
    // for(let i = 0; i < protein.insideDomain.length; i++){
    //     console.log(`inside, start_pos: ${protein.insideDomain[i].start_pos} | end_pos: ${protein.insideDomain[i].end_pos}`);
    // }
    
    proteinsData.push(protein);
  });
  return proteinsData;
};

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
  console.log(`Sequence: ${sequence}`);
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
                  console.log(`Protein Outside Start: ${start}, End: ${end}`);
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
        console.log(`entry start: ${entry.start_pos}, end: ${entry.end_pos}`)
    }
  }

  const domain = {o: outside, i: inside}
  return domain
}

export default { getProteins };