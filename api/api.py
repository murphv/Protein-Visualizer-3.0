from flask import Flask
from flask import request
import requests
import re
import pandas as pd

app = Flask(__name__)

@app.route('/api/data', methods=['POST', 'GET'])
def retrieve_api_data():
    if request.method == 'POST':
        accessionNum = request.get_json()
        
        url = 'https://rest.uniprot.org/uniprotkb/' + str(accessionNum.get('value'))
        url = url + '?'
        resp = requests.get(url=url)
        data = resp.json()

        def extract_glyco_bonds():
            filtered = [x for x in data['features'] if (x['type'] == 'Glycosylation')]
            positions = [x['location']['start'] for x in filtered if x['description'].find('N-linked') != -1]
            str_pos = ','.join(map(str,positions))
            return list(map(str,re.findall('\d+',str_pos)))

        def extract_ds_bonds():
            filtered = [x for x in data['features'] if (x['type'] == 'Disulfide bond')]
            start_positions = [x['location']['start'] for x in filtered]
            end_positions = [x['location']['end'] for x in filtered]
            start_pos = list(map(int,re.findall('\d+',(','.join(map(str,start_positions))))))
            end_pos = list(map(int,re.findall('\d+',(','.join(map(str,end_positions))))))
            return list(map(lambda x,y: str(x) + ' ' + str(y), start_pos, end_pos))
            # return list(zip(start_pos,end_pos))
        
        def extract_cysteines(ds_bonds):
            sequence = data['sequence']['value']
            pos = [m.start() for m in re.finditer('C', sequence)]
            total_cys = [str(x + 1) for x in pos]

            free_cys = []
            ds_list = [x.split(' ') for x in ds_bonds]
            for cys in total_cys:
                isSame = False
                for ds in ds_list:
                    if cys in ds:
                        isSame = True
                        break
                if isSame == False:
                    free_cys.append(cys)
            return (total_cys, free_cys)
        
        def extract_sequons(glyco_bonds):
            sequence = data['sequence']['value']
            nxt_pos = [m.start() for m in re.finditer('N[A-Z]T', sequence)]
            nxt_pos = [x + 1 for x in nxt_pos]
            nxs_pos = [m.start() for m in re.finditer('N[A-Z]S', sequence)]
            nxs_pos = [x + 1 for x in nxs_pos]
            seq_pos = sorted(nxt_pos + nxs_pos)
            
            seq_pos = [str(x) for x in seq_pos]
            free_seq = list(set(seq_pos) - set(glyco_bonds))
            return (seq_pos, free_seq)
        
        def parse_sequence(sequence, length):
            regex_out_exp = '[0-9]*o[0-9]*'
            regex_in_exp = '[0-9]*i[0-9]*'
            out_values = re.findall(regex_out_exp, sequence)
            outside = []
            for value in out_values:
                out_pos = []
                if(value[0] == 'o'):
                    out_pos = list(map(int,re.findall('\d+',str(value))))
                    out_pos.insert(0, 1)
                elif(value[-1] == 'o'):
                    out_pos = list(map(int,re.findall('\d+',str(value))))
                    out_pos.append(length)
                else:
                    out_pos = list(map(int,re.findall('\d+',str(value))))
                out_dict = {'start_pos': str(out_pos[0]), 'end_pos': str(out_pos[1])}
                outside.append(out_dict)

            in_values = re.findall(regex_in_exp, sequence)
            inside = []
            for value in in_values:
                in_pos = []
                if(value[0] == 'i'):
                    in_pos = list(map(int,re.findall('\d+',str(value))))
                    in_pos.insert(0, 1)
                elif(value[-1] == 'i'):
                    in_pos = list(map(int,re.findall('\d+',str(value))))
                    in_pos.append(length)
                else:
                    in_pos = list(map(int,re.findall('\d+',str(value))))
                in_dict = {'start_pos': str(in_pos[0]), 'end_pos': str(in_pos[1])}
                inside.append(in_dict)
            
            domain = (outside, inside)
            return domain
        
        def get_protein_info():
            top_df = pd.read_excel('C:/Users/manth/OneDrive/Documents/Protein Visualizer/protein-visualizer/api/venv/human_TM.xlsx') #must update before production
            entry = top_df[top_df['Name'] == str(accessionNum.get('value'))].iloc[0]
            domain = parse_sequence(entry['Orientation'], entry['Length'])
            sequons = extract_sequons(extract_glyco_bonds())
            cysteines = extract_cysteines(extract_ds_bonds())
            return {'Accession Num': entry['Name'], 'Protein Name': entry['Protein name'], 'Topology': entry['Orientation'], 'Length': str(entry['Length']), 'outsideDomain': domain[0],'insideDomain': domain[1], 'Glyco Bonds': extract_glyco_bonds(), 'Disulfide Bonds': extract_ds_bonds(), 'totalSequons': sequons[0], 'freeSequons':sequons[1],'totalCysteines': cysteines[0], 'freeCysteines': cysteines[1]}
            

        print(get_protein_info())
        return get_protein_info()
        

if __name__ == "__main__":
    app.run(debug=True)