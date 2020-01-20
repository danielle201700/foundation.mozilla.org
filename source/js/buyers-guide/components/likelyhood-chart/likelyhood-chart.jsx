// TODO: Inject likely % in .bar and .likelyhood-words

import React from "react";
import { Localized } from "@fluent/react";

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
                <span className="likely-label">
                  <Localized id="likely">{`Likely`}</Localized>
                </span>
              </th>
              <td className="likelyhood">
                <span className="bar" style={{ width: `${100 - perc}%` }} />
                <span className="likelyhood-words">
                  <Localized id="percent-likely-to-buy" $percent={100 - perc}>
                    {`{$percent}% likely to buy it`}
                  </Localized>
                </span>
              </td>
            </tr>
            <tr className="unlikely">
              <th>
                <span className="likely-label">
                  <Localized id="not-likely">{`Not likely`}</Localized>
                </span>
              </th>
              <td className="likelyhood">
                <span className="bar" style={{ width: `${perc}%` }} />
                <span className="likelyhood-words">
                  <Localized id="percent-not-likely-to-buy" $percent={perc}>
                    {`{$percent}% not likely to buy it`}
                  </Localized>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
