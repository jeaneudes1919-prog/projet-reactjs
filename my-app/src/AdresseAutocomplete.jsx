import { useState } from "react";

function AdresseAutocomplete({ value, onChange, disabled }) {
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (query) => {
    if (!query) return setSuggestions([]);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:BJ&key=YOUR_GOOGLE_API_KEY`
      );
      const data = await response.json();
      if (data.predictions) {
        setSuggestions(data.predictions.map((p) => p.description));
      }
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    onChange({ target: { name: "adresse", value: inputValue } });
    fetchSuggestions(inputValue);
  };

  const selectSuggestion = (suggestion) => {
    onChange({ target: { name: "adresse", value: suggestion } });
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Adresse :</label>
      <input
        type="text"
        name="adresse"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Commencez à taper (ville, quartier...)"
        className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-white text-white disabled:opacity-50"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 rounded-md w-full max-h-48 overflow-auto mt-1 z-10 text-black">
          {suggestions.map((s) => (
            <li
              key={s}
              className="p-2 cursor-pointer hover:bg-blue-100"
              onClick={() => selectSuggestion(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdresseAutocomplete;
