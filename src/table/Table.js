import React from "react";
import "./Table.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Table = ({ data, header, actions }) => {
  return (
    <table>
      <thead>
        <tr>
          {header.map((key) => (
            <th key={key}>{key}</th>
          ))}
          {actions?.length ? <th>Akcije</th> : null}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} onDoubleClick={() => actions[0].onClick(row)}>
            {Object.keys(row).map(
              (key) =>
                key != "id" &&
                (key != "evaluation" ? (
                  <td key={key}>{row[key]}</td>
                ) : (
                  <td key={key}>
                    <i
                      className={
                        row[key] === "Loše"
                          ? "fas fa-exclamation-circle redIcon"
                          : row[key] === "Nije loše"
                          ? "fas fa-exclamation-circle orangeIcon"
                          : row[key] === "Dobro"
                          ? "far fa-smile yellowGreenIcon"
                          : "far fa-smile greenIcon"
                      }
                    ></i>
                  </td>
                ))
            )}
            {actions?.length ? (
              <td>
                {actions?.length &&
                  actions?.map((action, actionIndex) =>
                    action.showAction(row) ? (
                      <button
                        className="iconButton"
                        key={actionIndex}
                        onClick={() => action.onClick(row)}
                        title={action.name}
                      >
                        <i className={action.iconClass}></i>
                      </button>
                    ) : null
                  )}
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
