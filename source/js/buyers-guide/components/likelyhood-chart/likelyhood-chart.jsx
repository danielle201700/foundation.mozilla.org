// TODO: Inject likely % in .bar and .likelyhood-words

import React from "react";

export default class LikelyhoodChart extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let values = this.props.values;
    let total = values[0] + values[1];
    let perc = 50;

    if (total > 0) {
      perc = Math.round((100 * values[0]) / total, 10);
    }

    return (
      <div>
        <table id="likelyhood-score">
          <tbody>
            <tr className="likely">
              <th>
                <span className="likely-label">likely</span>
              </th>
              <td className="likelyhood">
                <span className="bar" style={{ width: `${100 - perc}%` }} />
                <span className="likelyhood-words">
                  {100 - perc}% likely to {this.props.buyOrUse} it
                </span>
              </td>
            </tr>
            <tr className="unlikely">
              <th>
                <span className="likely-label">not likely</span>
              </th>
              <td className="likelyhood">
                <span className="bar" style={{ width: `${perc}%` }} />
                <span className="likelyhood-words">
                  {perc}% not likely to {this.props.buyOrUse} it
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
