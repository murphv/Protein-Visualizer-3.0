import React, { useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import './index.scss';
import { Button, OutlinedInput, InputLabel } from '@material-ui/core';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

/*
 * Protein search bar to search proteins in Uniprot database by their accession number.
 */
function SearchBar(props) {
  const [accessionNum, setAccessionNum] = useState('');

  //this function deals with individual character changes within the textfield
  const handleChange = (event) => {
    event.preventDefault();

    const value = event.target.value.toUpperCase();
    setAccessionNum({
      ...accessionNum,
      value
    });
  };
  //this function triggers when the submit button is hit
  const handleSubmit = (event) => {
    event.preventDefault();
    props.onSubmit(accessionNum);
  };

  //this function triggers when hit enter on the input bar
  const handleKeyUp = (event) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  return (
    <MuiThemeProvider>
      <FormControl className="search-form">
        <InputLabel style={{ marginLeft: '0.4rem' }}>
          Protein Accession Number
        </InputLabel>
        <OutlinedInput
          id="search-bar"
          style={{ marginTop: '1.0rem' }}
          placeholder="Ex. P04439"
          onChange={handleChange}
          onKeyUp={handleKeyUp}
        />
      </FormControl>
      <Button
        type="submit"
        variant="contained"
        style={{ marginTop: '1.5rem', marginLeft: '0.3rem' }}
        onClick={handleSubmit}
      >
        Search
      </Button>
    </MuiThemeProvider>
  );
}

export default SearchBar;
