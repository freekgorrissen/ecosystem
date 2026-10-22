import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import {
  DirectionsBike as BikeIcon,
  DirectionsBus as BusIcon,
  DirectionsCar as CarIcon,
  DirectionsWalk as WalkIcon,
  Train as TrainIcon,
} from "@mui/icons-material";
import type { CommuteOption, TravelMode } from "./commuteTypes";
import { formatTime } from "./formatTime";

const modeIcons: Record<TravelMode, React.ReactNode> = {
  car: <CarIcon fontSize="small" />,
  train: <TrainIcon fontSize="small" />,
  bus: <BusIcon fontSize="small" />,
  bike: <BikeIcon fontSize="small" />,
  walk: <WalkIcon fontSize="small" />,
};

const modeLabels: Record<TravelMode, string> = {
  car: "Car",
  train: "Train",
  bus: "Bus",
  bike: "Bike",
  walk: "Walk",
};

interface CommuteOptionCardProps {
  option: CommuteOption;
  fastest: boolean;
}

const CommuteOptionCard = ({ option, fastest }: CommuteOptionCardProps) => (
  <Card
    variant="outlined"
    sx={{
      height: "100%",
      borderColor: fastest ? "success.main" : undefined,
      borderWidth: fastest ? 2 : 1,
    }}
  >
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
          {option.name}
        </Typography>
        {fastest && <Chip label="Fastest" color="success" size="small" />}
      </Box>

      {option.error ? (
        <Alert severity="error">{option.error}</Alert>
      ) : (
        <>
          <Box sx={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", columnGap: 1.5, mb: 2 }}>
            <Typography variant="h4" component="p" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
              {option.total_minutes} min
            </Typography>
            {option.departure && option.arrival && (
              <Typography variant="body2" color="text.secondary">
                leave {formatTime(option.departure)} · arrive {formatTime(option.arrival)}
              </Typography>
            )}
          </Box>

          <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {option.legs.map((leg, index) => (
              <Box component="li" key={index} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                <Box sx={{ color: "text.secondary", pt: 0.25 }}>{modeIcons[leg.mode]}</Box>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatTime(leg.departure)}–{formatTime(leg.arrival)}{" "}
                    {leg.service ?? modeLabels[leg.mode]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                    {leg.from} → {leg.to}
                  </Typography>
                  {leg.disruptions.map((disruption, i) => (
                    <Alert key={i} severity="warning" sx={{ mt: 0.5, py: 0, fontSize: "0.8rem" }}>
                      <strong>{disruption.title}</strong>
                      {disruption.description && ` ${disruption.description}`}
                    </Alert>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </CardContent>
  </Card>
);

export default CommuteOptionCard;
