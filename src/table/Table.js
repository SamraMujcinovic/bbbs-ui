import React from "react";
import TableRow from "./TableRow";
import TableHeaderItem from "./TableHeaderItem";
import "./Table.css";

function Table(props) {
  return (
    <table className={props.customClass}>
      <thead>
        <tr>
          {props.theadData.map((h) => {
            return <TableHeaderItem key={h} item={h} />;
          })}
        </tr>
      </thead>
      <tbody>
        {props.tbodyData.length > 0 &&
          props.tbodyData.map((item) => {
            return (
              <TableRow
                key={item.id}
                data={item}
                getRowInfo={props.getRowData}
              />
            );
          })}
      </tbody>
    </table>
  );
}

export default Table;
