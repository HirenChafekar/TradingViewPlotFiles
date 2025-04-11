export const indicatorColorMap: { [key: string]: string } = {
    rsi: "orange",
    sma: "#00FFFF",
    ema: "#FFD700",
    macd: "#ADFF2F",
    bollinger: "#FF69B4",
    atr: "#7FFFD4",
  };
  
export const getRandomColor = () => {
  const colors = ["#FF4500", "#1E90FF", "#32CD32", "#FF1493", "#8A2BE2", "#00CED1"];
  return colors[Math.floor(Math.random() * colors.length)];
};