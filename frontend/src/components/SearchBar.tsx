import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
};

export default function SearchBar({ value, onChange, placeholder, loading = false }: Props) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Buscar rutinas"}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: loading ? (
          <InputAdornment position="end">
            <CircularProgress size={18} />
          </InputAdornment>
        ) : undefined,
      }}
    />
  );
}
