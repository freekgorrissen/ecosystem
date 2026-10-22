import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { apiGet } from "../api";
import commutePeople from "./CommutePeople";
import CommuteOptionCard from "./CommuteOptionCard";
import { formatTime } from "./formatTime";
import type { CommuteOption, CommuteResponse, Direction } from "./commuteTypes";

interface CommuteProps {
  accessToken: string;
  setAccessToken: (token: string | null) => void;
}

// Before noon you're going to work, after noon you're going home
const directionForNow = (): Direction => (new Date().getHours() < 12 ? "to_work" : "to_home");

// Fastest first; options that couldn't be planned go last
const byTotalTime = (a: CommuteOption, b: CommuteOption) =>
  (a.total_minutes ?? Infinity) - (b.total_minutes ?? Infinity);

interface PersonResult {
  response?: CommuteResponse;
  error?: string;
}

const Commute = ({ accessToken, setAccessToken }: CommuteProps) => {
  const [direction, setDirection] = useState<Direction>(directionForNow);
  const [results, setResults] = useState<Record<string, PersonResult>>({});
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // A refreshed token shouldn't trigger a second round of requests, so read it through a ref
  const auth = useRef({ accessToken, setAccessToken });
  auth.current = { accessToken, setAccessToken };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all(
      commutePeople.map(async (person): Promise<[string, PersonResult]> => {
        try {
          const response = await apiGet<CommuteResponse>(
            `/api/commute/${person.id}?direction=${direction}`,
            auth.current.accessToken,
            auth.current.setAccessToken
          );
          return [person.id, { response }];
        } catch (err) {
          return [person.id, { error: err instanceof Error ? err.message : "Something went wrong" }];
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      setResults(Object.fromEntries(entries));
      setUpdatedAt(new Date());
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [direction, refreshCount]);

  return (
    <Box sx={{ textAlign: "left" }}>
      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <ToggleButtonGroup
          value={direction}
          exclusive
          size="small"
          onChange={(_, value: Direction | null) => value && setDirection(value)}
        >
          <ToggleButton value="to_work">To work</ToggleButton>
          <ToggleButton value="to_home">To home</ToggleButton>
        </ToggleButtonGroup>
        <Tooltip title="Refresh">
          <span>
            <IconButton
              onClick={() => setRefreshCount((count) => count + 1)}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
        {loading && <CircularProgress size={20} />}
        {!loading && updatedAt && (
          <Typography variant="body2" color="text.secondary">
            Leaving now · updated {formatTime(updatedAt.toISOString())}
          </Typography>
        )}
      </Box>

      {commutePeople.map((person) => {
        const result = results[person.id];
        const options = [...(result?.response?.options ?? [])].sort(byTotalTime);
        const fastestId = options.find((option) => option.total_minutes !== null)?.id;

        return (
          <Box component="section" key={person.id} sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              {person.name}
            </Typography>
            {result?.error && <Alert severity="error">{result.error}</Alert>}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
                gap: 2,
              }}
            >
              {options.map((option) => (
                <CommuteOptionCard key={option.id} option={option} fastest={option.id === fastestId} />
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default Commute;
