import React from 'react';
import {
  Card,
  CardActions,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography
} from '@material-ui/core';
import Logo from '../../static/sunlab.png';
import './index.scss';

function Introduction(props) {
  const title = 'Protein Visualizer';

  const redirect = () => {
    window.location.href = 'http://www.sfu.ca/chemistry/groups/bingyun_sun/';
  };

  return (
    <div>
      <Card className="introduction--wrapper">
        <CardActionArea>
          <CardMedia
            component="img"
            alt="lab logo"
            height="140"
            image={Logo}
            className="introduction--logo"
            onClick={redirect}
          />
        </CardActionArea>
        <CardContent className="introduction--body">
          <Typography variant="h5" className="introduction--title">
            Protein Visualizer
          </Typography>
          <Typography variant="body1">
            This web application visualizes protein glycoslyation sites, disulfide bonds, sequon sites, 
            and cysteine sites to illustrate patterns in their arrangement in relation to the protein topology.
          </Typography>
          <ul>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
                Search for a human protein to visualize from the Uniprot database or select one of several 
                example proteins to visualize from the drop down menu located above this card.
              </Typography>
            </li>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
              If the current scale of the visualization is not sufficient to identify patterns, a sliding scale is provided 
              on the top right of the app bar to horizontally expand the protein.
              </Typography>
            </li>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
              In addition to the sliding scale, there is a window feature for each protein that allows users to target a specific 
              region for visualization. This feature is located below the original visualization.
              </Typography>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default Introduction;
