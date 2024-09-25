import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Tooltip
} from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PropTypes from 'prop-types';
// import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

import { makeStyles } from '@material-ui/core/styles';
import './index.scss';

// const theme = createMuiTheme({
//   palette: {
//     primary: '#FF6088',
//     secondary: '#7B82EE',
//   },
// });

// apple: createColor('#FF6088'),
//     skyBlue: createColor('#7B82EE'),

const useStyles = makeStyles({
  root: {
    Width: 275
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)'
  },
  title: {
    fontSize: 20,
    textDecoration: 'none',
    color: '#cb2d39',
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  pos: {
    marginBottom: 12
  }
});
/**
 *
 * @param {Object} props
 * @property {Object} glycoslation object containing glyco bond info
 * @property {Object} o_glcnac object containing O-GalNAc bond info
 * @property {Object} o_glc object containing O-Glc bond info
 * @property {Object} glycation object containing N-linked Glycation bond info
 * @property {Object} disulfideBonds object containing sulfide bond info
 * @property {func} toggleGlyco Function that toggles glyco bond visibility
 * @property {func} toggleOGalNAc Function that toggles O-GalNAc bond visibility
 * @property {func} toggleOGlc Function that toggles O-Glc bond visibility
 * @property {func} toggleGlycation Function that toggles N-linked Glycation bond visibility
 * @property {func} toggleSulfide Function that toggles sulfide bond visibility
 * @property {func} toggleOutsideDomain Function that toggles Outside Domain visibility
 * @property {func} toggleInsideDomain Function that toggles Inside Domain visibility
 * @property {func} toggleSequons Function that toggles Sequons visibility
 * @property {func} toggleCysteines Function that toggles Cysteines visibility
 * @property {number} length total length of protein structure
 * @property {string} species the species that the protein belong to
 */
function Legend(props) {
  const {
    glycoslation,
    o_glcnac,
    o_glc,
    glycation,
    disulfideBonds,
    sequons,
    cysteines,
    toggleGlyco,
    toggleOGalNAc,
    toggleOGlc,
    toggleGlycation,
    toggleSulfide,
    toggleOutside,
    toggleInside,
    toggleSequons,
    toggleCysteines,
    length,
    species
  } = props;
  const [showGlyco, setShowGlyco] = useState(true);
  const [showOGalNAc, setShowOGalNAc] = useState(true);
  const [showOGlc, setShowOGlc] = useState(true);
  const [showGlycation, setShowGlycation] = useState(true);
  const [showSulfide, setShowSulfide] = useState(true);
  const [showOutsideDomain, setShowOutside] = useState(true);
  const [showInsideDomain, setShowInside] = useState(true);
  const [showSequons, setShowSequons] = useState(true);
  const [showCysteines, setShowCysteines] = useState(true);
  const classes = useStyles();

  const handleToggle = element => {
    if (element === 'sulfide') {
      toggleSulfide(!showSulfide);
      setShowSulfide(!showSulfide);
    } else if(element === 'glyco'){
      toggleGlyco(!showGlyco);
      setShowGlyco(!showGlyco);
    } else if (element === 'o_glcnac') {
      toggleOGalNAc(!showOGalNAc);
      setShowOGalNAc(!showOGalNAc);
    } else if (element === 'o_glc') {
      toggleOGlc(!showOGlc);
      setShowOGlc(!showOGlc);
    } else if (glycation === 'glycation') {
      toggleGlycation(!showGlycation);
      setShowGlycation(!showGlycation);
    } else if(element === 'outside'){
      toggleOutside(!showOutsideDomain);
      setShowOutside(!showOutsideDomain);
    }else if(element === 'sequons'){
      toggleSequons(!showSequons);
      setShowSequons(!showSequons);
    }else if(element === 'cysteines'){
      toggleCysteines(!showCysteines);
      setShowCysteines(!showCysteines);
    }else{
      toggleInside(!showInsideDomain);
      setShowInside(!showInsideDomain);
    }
  };

  return (
    <Card variant="outlined" raised classes={{ root: 'legend--wrapper' }}>
      <CardContent>
        <div className="legend--header">
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
            display="inline"
          >
            Legend
          </Typography>
        </div>

        <div className="legend--menuItem">
          <Typography>
            N-Glycan:
            <Typography display="inline" classes={{ root: 'bold-text' }}>
              {glycoslation.length}
            </Typography>
          </Typography>
          <div className={`button-visibility${showGlyco ? '--on' : '--off'}`}>
            <Tooltip title="toggle visibility" placement="right-end">
              <IconButton
                aria-label="delete"
                className={{ root: 'on' }}
                onClick={() => handleToggle('glyco')}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="legend--menuItem">
          <Typography>
            O-GalNAc:
            <Typography display="inline" classes={{ root: 'bold-text' }}>
              {o_glcnac.length}
            </Typography>
          </Typography>
          <div className={`button-visibility${showOGalNAc ? '--on' : '--off'}`}>
            <Tooltip title="toggle visibility" placement="right-end">
              <IconButton
                aria-label="delete"
                className={{ root: 'on' }}
                onClick={() => handleToggle('o_glcnac')}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="legend--menuItem">
          <Typography>
            O-Glc:
            <Typography display="inline" classes={{ root: 'bold-text' }}>
              {o_glc.length}
            </Typography>
          </Typography>
          <div className={`button-visibility${showOGlc ? '--on' : '--off'}`}>
            <Tooltip title="toggle visibility" placement="right-end">
              <IconButton
                aria-label="delete"
                className={{ root: 'on' }}
                onClick={() => handleToggle('o_glc')}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="legend--menuItem">
          <Typography>
            Glycation:
            <Typography display="inline" classes={{ root: 'bold-text' }}>
              {glycation.length}
            </Typography>
          </Typography>
          <div className={`button-visibility${showGlycation ? '--on' : '--off'}`}>
            <Tooltip title="toggle visibility" placement="right-end">
              <IconButton
                aria-label="delete"
                className={{ root: 'on' }}
                onClick={() => handleToggle('glycation')}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="legend--menuItem">
          <Typography>
            Disulfides:
            <Typography display="inline" classes={{ root: 'bold-text' }}>
              {disulfideBonds.length}
            </Typography>
          </Typography>
          <div className={`button-visibility${showSulfide ? '--on' : '--off'}`}>
            <Tooltip title="toggle visibility" placement="right-end">
              <IconButton
                aria-label="delete"
                onClick={() => handleToggle('sulfide')}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="legend--menuItem">
          <Typography>
            Free Sequon:
            <Typography display="inline" classes={{ root: 'bold-text' }}>
              {sequons.length}
            </Typography>
          </Typography>
          <div className={`button-visibility${showSequons ? '--on' : '--off'}`}>
            <Tooltip title="toggle visibility" placement="right-end">
              <IconButton
                aria-label="delete"
                // className={{ root: 'on' }}
                onClick={() => handleToggle('sequons')}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="legend--menuItem">
          <Typography>
            Free Cysteine:
            <Typography display="inline" classes={{ root: 'bold-text' }}>
              {cysteines.length}
            </Typography>
          </Typography>
          <div className={`button-visibility${showCysteines ? '--on' : '--off'}`}>
            <Tooltip title="toggle visibility" placement="right-end">
              <IconButton
                aria-label="delete"
                // className={{ root: 'on' }}
                onClick={() => handleToggle('cysteines')}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="legend--menuItem">
          <Typography>
            Protein Length:
            <Typography display="inline" classes={{ root: 'bold-text' }}>
              {length}
            </Typography>
          </Typography>
        </div>
        <div className="legend--menuItem">
          <Typography>
            <br />
            Species:
            <Typography display="inline" classes={{ root: 'bold-text' }}>
              {species}
            </Typography>
          </Typography>
        </div>
        <div className="legend--menuItem" style={{ alignItems: 'center', marginTop: '10px', marginBottom: '-17px' }}>
          <Typography display="inline" placement="left-end" style={{ marginRight: '1rem', marginTop: '0.75rem' }}>
            Topology:
          </Typography>
          <Button placement="right-end" variant="outlined" color="primary"
                  style={{ marginRight: '1rem', marginTop: '1rem' }}
                  onClick={() => handleToggle('outside')}>Out</Button>
          <Button placement="right-end" variant="outlined" color="secondary" style={{ marginTop: '1rem' }}
                  onClick={() => handleToggle('inside')}>In</Button>
        </div>
      </CardContent>
    </Card>
  );
}

Legend.propTypes = {
  glycoslation: PropTypes.arrayOf(PropTypes.string).isRequired,
  o_glcnac: PropTypes.arrayOf(PropTypes.string).isRequired,
  o_glc: PropTypes.arrayOf(PropTypes.string).isRequired,
  glycation: PropTypes.arrayOf(PropTypes.string).isRequired,
  disulfideBonds: PropTypes.arrayOf(PropTypes.string).isRequired,
  sequons: PropTypes.arrayOf(PropTypes.string).isRequired,
  cysteines: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleOGalNAc: PropTypes.func,
  toggleGlyco: PropTypes.func,
  toggleOGlc: PropTypes.func,
  toggleGlycation: PropTypes.func,
  toggleSulfide: PropTypes.func,
  toggleOutside: PropTypes.func,
  toggleInside: PropTypes.func,
  toggleSequons: PropTypes.func,
  toggleCysteines: PropTypes.func,
  length: PropTypes.number.isRequired,
  species: PropTypes.string.isRequired
};

Legend.defaultProps = {
  toggleGlyco: () => {},
  toggleOGalNAc: () => {},
  toggleOGlc: () => {},
  toggleGlycation: () => {},
  toggleSulfide: () => {},
  toggleOutside: () => {},
  toggleInside: () => {},
  toggleSequons: () => {},
  toggleCysteines:() => {}
};

export default Legend;
