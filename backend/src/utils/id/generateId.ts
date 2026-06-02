export const generateId = (length = 9, split = 3): string => {
  split = split || 3;
  let len = length + Math.floor(length / split);
  let id = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 1; i <= len; i++) {
    if (i % (split + 1) === 0) id += "-";
    else id += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return id;
};