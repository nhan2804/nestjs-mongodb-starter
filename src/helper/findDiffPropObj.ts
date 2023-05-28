function deepEqual(value1, value2) {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) {
      return false;
    }
    for (let i = 0; i < value1.length; i++) {
      if (!deepEqual(value1[i], value2[i])) {
        return false;
      }
    }
    return true;
  } else if (typeof value1 === 'object' && typeof value2 === 'object') {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      if (!value2.hasOwnProperty(key) || !deepEqual(value1[key], value2[key])) {
        return false;
      }
    }
    return true;
  } else {
    return value1 === value2;
  }
}

function getDifferingProperties(object1, object2) {
  const differingProperties = {};

  // Check properties of object1
  for (const key in object1) {
    if (object1.hasOwnProperty(key)) {
      if (
        !object2.hasOwnProperty(key) ||
        !deepEqual(object1[key], object2[key])
      ) {
        differingProperties[key] = object1[key];
      }
    }
  }

  // Check properties of object2
  for (const key in object2) {
    if (object2.hasOwnProperty(key) && !object1.hasOwnProperty(key)) {
      differingProperties[key] = object2[key];
    }
  }

  return differingProperties;
}
export default getDifferingProperties;
