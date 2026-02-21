import React from "react";

export default function PriceList() {
  const prices = [
    { item: "ONLY SHIRT", price: "900" },
    { item: "FULL SHIRT", price: "1500" },
    { item: "FULL SHIRT AND CAP", price: "1800" },
    { item: "UPPER FULL BAZO", price: "2500" },
    { item: "SANDO HALF BAZO", price: "2000" },
    { item: "NIKKER", price: "600" },
  ];

  return (
    <div style={styles.container}>
      {prices.map((p, i) => (
        <div key={i} style={styles.row}>
          <span style={styles.item}>{p.item}</span>
          <span style={styles.price}>{p.price}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#1e3a8a",
    minHeight: "100vh",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    background: "rgba(255,255,255,0.1)",
    padding: "15px 20px",
    marginBottom: "12px",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "700",
  },
  item: {
    fontSize: "16px",
  },
  price: {
    fontSize: "20px",
    color: "#fbbf24",
    fontWeight: "900",
  },
};