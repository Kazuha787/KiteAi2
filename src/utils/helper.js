export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatAddress = (address) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDuration = (ms) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
};

export const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

export const formatError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return error.message || "Unknown error occurred";
};

export const getTimestamp = () => {
  return new Date().toLocaleTimeString();
};

export const formatStats = (stats) => {
  const successRate = calculatePercentage(stats.successful, stats.total);
  return [
    `Total Requests: ${stats.total}`,
    `Successful: ${stats.successful}`,
    `Failed: ${stats.failed}`,
    `Success Rate: ${successRate}%`,
  ].join("\n");
};
