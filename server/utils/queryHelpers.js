export function createSetString(obj) {
    let str = '';
    for (const [key, value] of Object.entries(obj)) {
      str += str === '' ? `${key}='${value}'` : `, ${key}='${value}'`;
    }
    return str;
  }