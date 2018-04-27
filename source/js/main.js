/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "React" }] */

import React from 'react';
import ReactGA from 'react-ga';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';

import JoinUs from './components/join/join.jsx';
import Petition from './components/petition/petition.jsx';
import PrimaryNav from './components/nav/nav.jsx';
import People from './components/people/people.jsx';
import Takeover from './components/takeover/takeover.jsx';
import MemberNotice from './components/member-notice/member-notice.jsx';
import MultipageNav from './components/multipage-nav/multipage-nav.jsx';
import Highlights from './components/highlights/highlights.jsx';
import Leaders from './components/leaders/leaders.jsx';
import HomeNews from './components/home-news/home-news.jsx';
import News from './components/news/news.jsx';
import SingleFilterFellowList from './components/fellow-list/single-filter-fellow-list.jsx';
import PulseProjectList from './components/pulse-project-list/pulse-project-list.jsx';

const SHOW_MEMBER_NOTICE = false;

// To be populated via XHR...
let env, networkSiteURL;

let main = {
  init() {
    this.fetchEnv((envData) => {
      env = envData;
      networkSiteURL = env.NETWORK_SITE_URL;

      // HEROKU_APP_DOMAIN is used by review apps
      if (!networkSiteURL && env.HEROKU_APP_NAME) {
        networkSiteURL = `https://${env.HEROKU_APP_NAME}.herokuapp.com`;
      }

      this.fetchHomeDataIfNeeded((data) => {
        this.injectReactComponents(data);
        this.bindGlobalHandlers();
      });
    });
  },

  fetchEnv(callback) {
    let envReq = new XMLHttpRequest();

    envReq.addEventListener(`load`, () => {
      callback.call(this, JSON.parse(envReq.response));
    });

    envReq.open(`GET`, `/environment.json`);
    envReq.send();
  },

  fetchHomeDataIfNeeded(callback) {
    // Only fetch data if you're on the homepage
    if (document.querySelector(`#view-home`)) {
      let homepageReq = new XMLHttpRequest();

      homepageReq.addEventListener(`load`, () => {
        callback.call(this, JSON.parse(homepageReq.response));
      });

      homepageReq.open(`GET`, `${networkSiteURL}/api/homepage/`);
      homepageReq.send();
    } else {
      callback.call(this, {});
    }
  },

  bindGlobalHandlers() {
    // Track window scroll position and add/remove class to change sticky header appearance

    let lastKnownScrollPosition = 0;
    let ticking = false;
    let elBurgerWrapper = document.querySelector(`.wrapper-burger`);

    let adjustNavbar = (scrollPosition) => {
      if (scrollPosition > 0) {
        elBurgerWrapper.classList.add(`scrolled`);
      } else {
        elBurgerWrapper.classList.remove(`scrolled`);
      }
    };

    window.addEventListener(`scroll`, () => {
      lastKnownScrollPosition = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          adjustNavbar(lastKnownScrollPosition);
          ticking = false;
        });
      }

      ticking = true;
    });

    // Adjust #hero offset on load and window resize to accomodate the sticky header

    let elHero = document.querySelector(`#hero`);
    let elStickyTop = document.querySelector(`.sticky-top`);

    let adjustHero = () => {
      elHero.style.paddingTop = `${elStickyTop.clientHeight}px`;
      elHero.style.marginTop = `-${elStickyTop.clientHeight}px`;
    };

    adjustHero();

    window.addEventListener(`resize`, () => {
      adjustHero();
    });

    // Extra tracking

    document.getElementById(`donate-header-btn`).addEventListener(`click`, () => {
      ReactGA.event({
        category: `donate`,
        action: `donate button tap`,
        label: `${document.title} header`
      });
    });

    document.getElementById(`donate-footer-btn`).addEventListener(`click`, () => {
      ReactGA.event({
        category: `donate`,
        action: `donate button tap`,
        label: `${document.title} footer`
      });
    });
  },

  // Embed various React components based on the existence of containers within the current page
  injectReactComponents(data) {
    let primaryNavContainer = document.getElementById(`primary-nav-container`);
    let primaryNavLinks = document.getElementById(`primary-nav-links`);

    if (primaryNavContainer && primaryNavLinks) {
      // Need to check for zen mode data att
      ReactDOM.render(
        <PrimaryNav {...primaryNavContainer.dataset}/>,
        primaryNavLinks
      );
    }

    if (SHOW_MEMBER_NOTICE && document.getElementById(`member-notice`)) {
      ReactDOM.render(<MemberNotice />, document.getElementById(`member-notice`));
    }

    // Show Takeover for new visitors
    if (env.SHOW_TAKEOVER && !Cookies.get(`seen-takeover`) && document.querySelector(`#view-home .takeover`)) {
      let elWrapper = document.querySelector(`#view-home > .wrapper`);

      // Don't allow the content block to scroll
      elWrapper.style.overflow = `hidden`;
      elWrapper.style.height = `100vh`;

      let onTakeoverHide = () => {
        // Allow scrolling again when the takeover is dismissed
        elWrapper.style.overflow = null;
        elWrapper.style.height = null;
      };

      ReactDOM.render(<Takeover onHide={onTakeoverHide} />, document.querySelector(`#view-home .takeover`));
      Cookies.set(`seen-takeover`, `true`, { expires: 365 });
      ReactGA.pageview(`/welcome-splash`);
    }

    // Embed additional instances of the Join Us box that don't need an API exposed (eg: Homepage)
    if (document.querySelectorAll(`.join-us:not(#join-us)`)) {
      var elements = Array.from(document.querySelectorAll(`.join-us:not(#join-us)`));

      if (elements.length) {
        elements.forEach(element => {
          var props = element.dataset;

          ReactDOM.render(<JoinUs {...props} isHidden={false} />, element);
        });
      }
    }

    // petition elements
    var petitionElements = Array.from(document.querySelectorAll(`.sign-petition`));

    petitionElements.forEach(element => {
      var props = element.dataset;

      props.apiUrl = `${networkSiteURL}/api/campaign/petitions/${props.petitionId}/`;

      ReactDOM.render(<Petition {...props} isHidden={false} />, element);
    });

    if (document.getElementById(`people`)) {
      ReactDOM.render(<People env={env} />, document.getElementById(`people`));
    }

    // Multipage nav used in landing pages
    if (document.querySelector(`#multipage-nav`)) {
      let links = [];

      links = [].map.call(document.querySelectorAll(`#multipage-nav div a`), (child) => {
        return {
          label: child.textContent.trim(),
          href: child.getAttribute(`href`),
          isActive: !!child.getAttribute(`class`).match(/active/)
        };
      });

      ReactDOM.render(<MultipageNav links={links} />, document.querySelector(`#multipage-nav-mobile .container .row .col-12`));
    }

    // Homepage

    if (data) {
      // Leaders
      if (document.querySelector(`#featured-people-box`)) {
        ReactDOM.render(<Leaders data={data.leaders} />, document.querySelector(`#featured-people-box`));
      }

      // Home News
      if (document.querySelector(`#home-news`)) {
        ReactDOM.render(<HomeNews data={data.news} />, document.querySelector(`#home-news`));
      }

      // Highlights
      if (document.querySelector(`#home-highlights`)) {
        ReactDOM.render(<Highlights data={data.highlights} />, document.querySelector(`#home-highlights`));
      }
    }

    // News
    if (document.querySelector(`#news`)) {
      ReactDOM.render(<News env={env} />, document.querySelector(`#news`));
    }

    // Fellowships single filter fellow list
    let singleFilterFellowList = Array.from(
      document.querySelectorAll(`.single-filter-fellow-list`)
    );

    singleFilterFellowList.forEach(target => {
      return ReactDOM.render(
        <SingleFilterFellowList
          env={env}
          filterType={target.dataset.filterType}
          filterOptions={target.dataset.filterOptions.split(`,`)}
          selectedOption={target.dataset.selectedOption}
        />, target
      );
    });

    // Pulse project lists
    let pulseProjectList = Array.from(
      document.querySelectorAll(`.pulse-project-list`)
    );

    // TODO: once we switch off Mezzanine, we can remove the mezzanine-template
    //       attribute checks here (the !! checks in the code below).
    pulseProjectList.forEach(target => {
      return ReactDOM.render(
        <PulseProjectList
          env={env}
          query={ target.getAttribute(`for`) || `` }
          reverseChronological={ target.getAttribute(`rev`) === null || target.getAttribute(`rev`) !== `False` }
          featured={ !!target.getAttribute(`checked`) && target.getAttribute(`checked`) !== `False` }
          max={parseInt(target.getAttribute(`size`), 10) || null} />,
        target
      );
    });
  }
};

main.init();

// Append Google Analytics code
import './analytics.js';
