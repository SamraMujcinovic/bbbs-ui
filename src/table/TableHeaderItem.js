import React from "react";

function TableHeaderItem({ item }) {
  return (
    <th key={item} title={item}>
      {item}
    </th>
  );
}

export default TableHeaderItem;
