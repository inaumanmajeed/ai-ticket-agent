import axios from "axios";

export async function embedText(text) {
  const res = await axios.post("http://localhost:5050/embed", { text });
  return res.data.embedding;
}
