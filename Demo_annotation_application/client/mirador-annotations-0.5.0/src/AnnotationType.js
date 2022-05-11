import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import ListSubheader from '@mui/material/ListSubheader';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200,
    },
  },
};

const defaultTypes = [
    "Text"
]

const damageTypes = [
  "Edge",
  "Bump(ed)",
  "Blister",
  "Shiny",
  "Crack",
  "Moldy",
  "Laminate",
  "(dis)coloration",
  "Other object",
  "Corrosion",
  "Layer",
  "Drip",
  "Seam",
  "Impact",
  "Dig",
  "Tear",
  "Discoloured",
  "Fly speck",
  "Slack",
  "Disjointed",
  "Relining",
  "Chip",
  "Squashed",
  "Blanched",
  "Thickening-out",
  "Finger print",
  "Dirty",
  "Fragile",
  "Brittle",
  "Rub",
  "Scratch",
  "Moisture",
  "Curved",
  "Irregular",
  "Interstice",
  "Yellowed",
  "Joint",
  "Visible",
  "Deficient",
  "Re-mounting",
  "(semi) dull",
  "Mould",
  "Nervure",
  "Knot",
  "Darkened",
  "Undulation",
  "Oxidation",
  "Cradle",
  "Foxing",
  "Crease",
  "Dust",
  "Priming",
  "Patching",
  "Inpainting",
  "Resoration",
  "Touching up",
  "Rust",
  "Rough",
  "Dirt",
  "Lifting up",
  "Stain",
  "Tension",
  "Hole",
  "Wear",
  "Worm-eaten",
  "Woodworm",
  "Varnish"
];

function getStyles(name, annotationName, theme) {
  return {
    fontWeight:
      annotationName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultipleSelectChip() {
  const theme = useTheme();
  const [annotationName, setAnnotationName] = React.useState([]);
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setAnnotationName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <div>
      <FormControl sx={{ m: 1, width: 200}}>
        <InputLabel id="demo-multiple-chip-label">Type</InputLabel>
        <Select
          multiple
          value={annotationName}
          onChange={handleChange}
          input={<OutlinedInput id="annotationType" label="Annotationtype" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value}/>
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
        <ListSubheader>Main</ListSubheader>
          {defaultTypes.map((name) => (
            <MenuItem
              key={name}
              value={name}
              style={getStyles(name, annotationName, theme)}
            >
              {name}
            </MenuItem>
          ))}
        <ListSubheader>Damage</ListSubheader>
          {damageTypes.sort().map((name) => (
            <MenuItem
              key={name}
              value={name}
              style={getStyles(name, annotationName, theme)}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
