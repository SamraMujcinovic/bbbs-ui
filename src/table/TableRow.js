import React from "react";
import { FaCheck, FaExclamation, FaPen } from "react-icons/fa";

function TableRow(props) {
  return (
    <tr onDoubleClick={() => props.getRowInfo(props.data)}>
      {Object.entries(props.data).map(([key, val]) => {
        if (key !== "evaluation") {
          return key !== "id" && <td key={key}>{val}</td>;
        } else {
          if (val === "Loše") {
            return (
              <td key={key}>
                <FaExclamation className="badEvaluation" />
              </td>
            );
          } else {
            return (
              <td key={key}>
                <FaCheck
                  className={
                    "" +
                    (val === "Super" ? "greatEvaluation" : "goodEvaluation")
                  }
                />
              </td>
            );
          }
        }
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
