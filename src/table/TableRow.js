import React from "react";
import { FaPen } from "react-icons/fa";

function TableRow(props) {
  return (
    <tr onDoubleClick={() => props.getRowInfo(props.data)}>
      {Object.entries(props.data).map(([key, val]) => {
        return key !== "id" && <td key={key}>{val}</td>;
      })}
      <td>
        <button
          className="editButton"
          onClick={() => props.getRowInfo(props.data)}
        >
          <FaPen />
        </button>
      </td>
    </tr>
  );
}

export default TableRow;
