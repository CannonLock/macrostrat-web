import React, { useState } from "react";
import Collapse from "@material-ui/core/Collapse";

import AddBoxIcon from "@material-ui/icons/AddBoxOutlined";
import RemoveCircleOutlinedIcon from "@material-ui/icons/RemoveCircleOutlined";

function Article(props) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  const buttonClasses = {
    root: "expand-button",
  };
  // Attempt to pull out only the year and not the whole date
  let year;
  try {
    year = this.props.data.coverdate
      ? this.props.data.coverdate.match(/\d{4}/)[0]
      : "";
  } catch (e) {
    year = "";
  }

  let authors = props.data.hasOwnProperty("authors")
    ? props.data.authors
        .map((d) => {
          return d.name;
        })
        .join(", ")
    : "";

  return (
    <div className="article">
      <div className="article-title">
        <p className="article-author">
          {authors ? authors : "Unknown"},{" "}
          {year.length ? " " + year + ". " : ""}
        </p>
        <a href={props.data.url} target="_blank" className="title-link">
          <strong>{props.data.title}.</strong>
        </a>

        <span>
          <AddBoxIcon
            onClick={toggleExpand}
            classes={buttonClasses}
            className={expanded ? "hidden" : ""}
          />
          <RemoveCircleOutlinedIcon
            onClick={toggleExpand}
            classes={buttonClasses}
            className={expanded ? "" : "hidden"}
          />
        </span>
      </div>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <span className={expanded ? "" : "hidden"}>
          <div className="quotes">
            {props.data.snippets.map((snippet, si) => {
              let text = snippet
                .replace(/<em class="hl">/g, "@@@")
                .replace(/<\/em>/g, "***")
                .replace(/(?:\r\n|\r|\n|\<|\>)/g, " ")
                .trim()
                .replace(/@@@/g, '<em class="hl">')
                .replace(/\*\*\*/g, "</em>");
              return (
                <p
                  className="gdd-snippet"
                  key={si}
                  dangerouslySetInnerHTML={{ __html: "..." + text + "..." }}
                ></p>
              );
            })}
          </div>
        </span>
      </Collapse>
    </div>
  );
}

export default Article;
