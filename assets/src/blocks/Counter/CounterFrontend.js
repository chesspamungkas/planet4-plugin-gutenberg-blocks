import { Component, Fragment } from '@wordpress/element';

export class CounterFrontend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remaining: 0,
      completed: 0
    };

    this.calculateRemaining = this.calculateRemaining.bind(this);
    this.getCounterText = this.getCounterText.bind(this);
  }

  componentDidMount() {
    // Calculate completed and remaining values depending on props
    this.calculateRemaining();
  }

  componentDidUpdate({ target: prevTarget, completed: prevCompleted, completed_api: prevCompletedApi }) {
    // Update completed and remaining values depending on props
    const { target, completed, completed_api } = this.props;
    if (target !== prevTarget || completed !== prevCompleted || completed_api !== prevCompletedApi) {
      this.calculateRemaining();
    }
  }

  calculateRemaining() {
    const { completed_api } = this.props;
    const target = this.props.target || 0;
    let completed = this.props.completed || 0;
    let remaining = 0;
    if (completed_api) {
      fetch(completed_api)
        .then(response => response.json())
        .then(({ unique_count }) => {
          if (unique_count) {
            completed = unique_count;
            this.setState({
              completed,
              remaining: target - completed
            });
          }
        });
    } else if (target > 0 || completed > 0) {
      remaining = target - completed;
      this.setState({ remaining, completed });
    }
  }

  getCounterText() {
    const { text, target } = this.props;
    const { remaining, completed } = this.state;

    const COUNTER_TEXT = {
      '%completed%': `<span class="counter-target">${completed}</span>`,
      '%target%': `<span class="counter-target">${target}</span>`,
      '%remaining%': `<span class="counter-target">${remaining}</span>`
    };

    return text.replace(/%completed%|%target%|%remaining%/gi, match => COUNTER_TEXT[match]);
  }

  render() {
    const {
      className,
      title,
      description,
      text,
      target
    } = this.props;

    const { completed } = this.state;

    let style = 'plain';
    if (className) style = className.split('is-style-')[1];
    let arcLength = 31.5;
    
    const percent = target > 0 ? Math.round(completed / target * 100) : 0;

    return (
      <Fragment>
        <section className={`block container counter-block counter-style-${style}`}>
          <div className="container">
            {title &&
              <header>
                <h2 className="page-section-header">{title}</h2>
              </header>
            }
            {description &&
              <p className="page-section-description" dangerouslySetInnerHTML={{ __html: description }} />
            }
          </div>
          <div className="content-counter">
            {(style === 'bar' || style === 'en-forms-bar') &&
              <div className="progress-container">
                <div className={`progress-bar ${style === 'en-forms-bar' ? 'enform-progress-bar' : ''}`} style={{ width: `calc(${percent}% + 20px)` }} />
              </div>
            }
            {style === 'arc' &&
              <svg className="progress-arc" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 14">
                <path className="background" d="M 2 12 A 1 1 0 1 1 22 12" />
                <path className="foreground" d="M 2 12 A 1 1 0 1 1 22 12"
                  strokeDasharray={arcLength}
                  strokeDashoffset={`${(1 - percent / 100) * arcLength}`} />
              </svg>
            }
            {text &&
              <div
                className={`counter-text ${100 <= percent ? 'counter-text-goal_reached' : ''}`}
                dangerouslySetInnerHTML={{ __html: this.getCounterText() }}
              />
            }
          </div>
        </section>
      </Fragment>
    )
  }
}
