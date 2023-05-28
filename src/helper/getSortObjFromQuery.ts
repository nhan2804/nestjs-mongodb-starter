const getSortObjFromQuery = (query: { field: string; order: string }[]) => {
  const result =
    query?.reduce((all, cur) => {
      if (cur?.order === 'descend') all[cur?.field] = -1;
      if (cur?.order === 'ascend') all[cur?.field] = 1;
      return all;
    }, {}) || {};
  return Object.keys(result || {}).length ? result : null;
};
export default getSortObjFromQuery;
