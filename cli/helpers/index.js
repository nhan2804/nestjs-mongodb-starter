const extractParamString = (inputString) => {
  const regex = /\${([^}]+)}/g;

  // Extract all parameters using matchAll()
  const matches = [...inputString?.matchAll(regex)];

  // Extracted parameters will be available in the matches array
  const params = matches.map((match) => match[1]);
  return params;
};
const extractColumnSchema = (inputString) => {
  inputString = inputString?.toLowerCase();
  if (!inputString?.trim() || inputString === 'n' || inputString === 'no') {
    return '';
  }
  const columns = inputString?.split(',')?.map((e) => e?.trim());
  return columns?.map((e) => {
    const c = e
      ?.split(':')
      ?.map((e) => e?.trim())
      ?.filter((e) => !!e);

    const colum = {
      title: c?.[0],
      key: c?.[1],
      dataIndex: c?.[1],
      ...(!!c?.[2] ? { searchType: c?.[2] } : {}),
    };

    return colum;
  });
};

module.exports = {
  extractParamString,
  extractColumnSchema,
};
