import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Messages({ revenirDashboard }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await axios.get("http://localhost:3000/api/support/messages?utilisateur_id=1");
        console.log("Messages reçus:", res.data);
        setMessages(res.data);
        setLoading(false);
        await axios.post("http://localhost:3000/api/support/marquer-lus", { utilisateur_id: 1 });
      } catch (err) {
        setErreur("Erreur lors du chargement des messages.");
        setLoading(false);
        console.error(err);
      }
    }

    fetchMessages();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (erreur) return <p style={{ color: "red" }}>{erreur}</p>;

  return (
    <div>
      <button onClick={revenirDashboard}>Retour au Dashboard</button>
      {messages.length === 0 ? (
        <p>Aucun message reçu.</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.id}>
            <h3>{msg.objet}</h3>
            <p>{msg.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
