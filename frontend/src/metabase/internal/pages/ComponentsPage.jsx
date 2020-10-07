/* @flow */

import React, { Component } from "react";
import { Link, Route } from "react-router";

import { slugify } from "metabase/lib/formatting";
import cx from "classnames";

// $FlowFixMe: react-virtualized ignored
import reactElementToJSXString from "react-element-to-jsx-string";
import prettier from "prettier/standalone";
import prettierParserBabylon from "prettier/parser-babylon";

import COMPONENTS from "../lib/components-webpack";

import AceEditor from "metabase/components/TextEditor";
import CopyButton from "metabase/components/CopyButton";
import Icon from "metabase/components/Icon";

import Props from "metabase/internal/components/Props";
import Example from "metabase/internal/components/Example";

const Section = ({ title, children }) => (
  <div className="mb2">
    {title && <h3 className="my2">{title}</h3>}
    {children}
  </div>
);

function getComponentName(component) {
  return (
    (component && (component.displayName || component.name)) || "[Unknown]"
  );
}
function getComponentSlug(component) {
  return slugify(getComponentName(component));
}

export default class ComponentsPage extends Component {
  static routes: ?[React$Element<Route>];
  render() {
    const componentName = slugify(this.props.params.componentName);
    const exampleName = slugify(this.props.params.exampleName);
    return (
      <div className="wrapper wrapper--trim">
        <div>
          <div className="py4">
            {COMPONENTS.filter(
              ({ component, description, examples }) =>
                !componentName || componentName === getComponentSlug(component),
            ).map(({ component, description, examples }, index) => (
              <div
                id={getComponentSlug(component)}
                key={index}
                className="border-bottom mb4 pb3 px4"
              >
                <h2>
                  <Link
                    to={`_internal/components/${getComponentSlug(component)}`}
                    className="no-decoration"
                  >
                    {getComponentName(component)}
                  </Link>
                </h2>
                {description && <p className="my2">{description}</p>}
                {componentName === getComponentSlug(component) &&
                  component.propTypes && (
                    <Section title="Props">
                      <Props of={component} />
                    </Section>
                  )}
                {examples && (
                  <Section>
                    {Object.entries(examples)
                      .filter(
                        ([name, element]) =>
                          !exampleName || exampleName === slugify(name),
                      )
                      .map(([name, element]) => {
                        console.log("element", element);
                        return (
                          <div className="my2">
                            <h4 className="my1">
                              <Link
                                to={`_internal/components/${getComponentSlug(
                                  component,
                                )}/${slugify(name)}`}
                                className="no-decoration"
                              >
                                {name}:
                              </Link>
                            </h4>
                            <Example>{element}</Example>
                          </div>
                        );
                      })}
                  </Section>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

class SourcePane extends React.Component {
  state = {
    isOpen: true,
  };
  render() {
    const { element } = this.props;
    const { isOpen } = this.state;
    let source = reactElementToJSXString(element, {
      showFunctions: true,
      showDefaultProps: false,
    });
    try {
      source = prettier.format(source, {
        parser: "babel",
        plugins: [prettierParserBabylon],
      });
    } catch (e) {
      console.log(e);
    }

    const scratchUrl = "/_internal/scratch#" + btoa(source);
    return (
      <div
        className={cx("relative", {
          "border-left border-right border-bottom": isOpen,
        })}
      >
        {isOpen && (
          <AceEditor
            value={source}
            mode="ace/mode/jsx"
            theme="ace/theme/metabase"
            readOnly
          />
        )}
        {isOpen ? (
          <div className="absolute top right z2 flex align-center p1 text-medium">
            <CopyButton
              className="ml1 text-brand-hover cursor-pointer"
              value={source}
            />
            <Link to={scratchUrl}>
              <Icon
                name="pencil"
                className="ml1 text-brand-hover cursor-pointer"
              />
            </Link>
            <Icon
              name="close"
              className="ml1 text-brand-hover cursor-pointer"
              onClick={() => this.setState({ isOpen: false })}
            />
          </div>
        ) : (
          <div className="p1 flex align-ceneter justify-end">
            <Link className="link ml1" to={scratchUrl}>
              Open in Scratch
            </Link>
            <span
              className="link ml1"
              onClick={() => this.setState({ isOpen: true })}
            >
              View Source
            </span>
          </div>
        )}
      </div>
    );
  }
}
