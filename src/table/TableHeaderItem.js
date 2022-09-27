import React from "react";

function TableHeaderItem({ item }) {
  return (
    <td key={item} title={item}>
      {item}
    </td>
  );
}

export default TableHeaderItem;
