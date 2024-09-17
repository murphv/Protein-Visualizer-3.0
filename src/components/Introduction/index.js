import React from 'react';
import {
  Card,
  CardActions,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
  Link
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
            // height="120"
            image={Logo}
            className="introduction--logo"
            onClick={redirect}
          />
        </CardActionArea>
        <CardContent className="introduction--body">
          <Typography variant="h5" className="introduction--title">
            Protein Visualizer 3.0
          </Typography>
          <Typography variant="body1">
            This web application visualizes protein topology (obtained from <a
            href="https://www.uniprot.org/">DeepTMHMM</a>),
            glycosylation sites, disulfide bonds, sequon sites, and cysteine
            sites (obtained from <a href="https://www.uniprot.org/">UniProt</a>) to illustrate patterns
            in their arrangement in relation to the protein topology.
          </Typography>
          <ul className="introduction--ul">
          <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
                Search for a protein from ten different species (Human, mouse, yeast, worm, rat, Pyrobaculum, plant,
                fly, fish and Aeropyrum) to visualize from the Uniprot database or select one of several example
                proteins with conflicts to visualize from the drop down menu located above this card.
                Search feature is case-insensitive.
              </Typography>
            </li>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
                If the current scale of the visualization is not sufficient to identify patterns, a sliding scale is
                provided
                on the top right of the app bar to horizontally expand the protein.
              </Typography>
            </li>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
                In addition to the sliding scale, there is a window feature for each protein that allows users to target
                a specific
                region for visualization. This feature is located below the original visualization.
              </Typography>
            </li>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
                The legend moves with the page as the user scrolls, keeping the information always within reach.
                Additionally, the
                legend and each protein feature can be toggled to enhance viewability.
              </Typography>
            </li>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
                An export image feature is provided, allowing users to capture publication-quality snapshots of the
                protein and the window. User can choose between export PDF, PNG or SVG
              </Typography>
            </li>
          </ul>
          <Typography variant="body1">
            Previous Versions:
            <br />
            <Link href="https://sfu-sun-lab.github.io/protein-visualizer/">
              Protein Visualizer 1.0
            </Link>
            <br />
            <Link href="https://mdesai31.github.io/Protein-Visualizer-2.0/">
              Protein Visualizer 2.0
            </Link>
          </Typography>
          <br />
          <Typography variant="body1">
          Please cite following publication(s) when using the visualizer:
          </Typography>
          <ul className="introduction--ul">
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
                <Link href='https://doi.org/10.3390/ijms242216182'>
                Discovery and Visualization of the Hidden Relationships among N-Glycosylation, Disulfide Bonds, and Membrane Topology.
                </Link>
                <br/>
                International Journal of Molecular Sciences. 2023; 24(22):16182.
              </Typography>
            </li>
          </ul>
          <Typography variant="body1">
          For further information, contact Dr. Bingyun Sun: bingyun_sun@sfu.ca
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default Introduction;
