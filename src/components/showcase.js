import React from "react";
import {Router, Route, browserHistory, Link} from "react-router";
import OnsNavigatorContext from './onsen/ons-navigator';
import OnsToolbar from './onsen/ons-toolbar';
import OnsPage from './onsen/ons-page';
import OnsSplitter from './onsen/ons-splitter';
import OnsSplitterSide from './onsen/ons-splitter/side';
import OnsSplitterContent from './onsen/ons-splitter/content';
import OnsCarousel from './onsen/ons-carousel';
import OnsCarouselItem from './onsen/ons-carousel/item';
import OnsBackButton from './onsen/ons-back-button';
import OnsAlertDialog from './onsen/ons-alert-dialog';
import OnsList from './onsen/ons-list';
import OnsListItem from './onsen/ons-list/item';
import OnsListHeader from './onsen/ons-list/header';
import OnsIcon from './onsen/ons-icon';
import OnsToolbarButton from './onsen/ons-toolbar/button';
import OnsButton from './onsen/ons-button';
import OnsSwitch from './onsen/ons-switch';


class TestDialog extends OnsAlertDialog {

	renderContent() {
		return (
			<div>
				<div className="alert-dialog-title">Warning!</div>
		    <div className="alert-dialog-content">
		      An error has occurred!
		    </div>
		    <div className="alert-dialog-footer">
		      <button className="alert-dialog-button"
						onClick={this.close}>OK</button>
					<button className="alert-dialog-button"
						onClick={() => OnsAlertDialog.show(TestDialog)}>Push another when closed</button>
		    </div>
			</div>
		);
	}
}


class PageA extends OnsPage {
  static contextTypes = {
    router: React.PropTypes.object,
  };

	renderToolbar() {
		return (
			<OnsToolbar>
				<div className="center">Title</div>
				<div className="right"><OnsToolbarButton><OnsIcon icon="ion-navicon" size="30px" /></OnsToolbarButton></div>
			</OnsToolbar>
		);
	}

	renderContent() {
		return (
			<div>
				<OnsCarousel swipeable overscrollable autoScroll fullscreen>
          <OnsCarouselItem>
            <OnsList>
              <OnsListHeader>Some header</OnsListHeader>
              <OnsListItem>
                <div className="center">Draggable switcher</div>
                <div className="right"><OnsSwitch /></div>
              </OnsListItem>
              <OnsListItem>
                Other controls coming soon...
              </OnsListItem>
              <OnsListItem>
                It is a fullscreen carousel. Swipe!
              </OnsListItem>
              <OnsListItem>
                There is also a sidebar. Swipe from left edge
              </OnsListItem>
            </OnsList>
          </OnsCarouselItem>
					<OnsCarouselItem>
						<OnsList>
							<OnsListItem tappable modifier="chevron" onClick={() => this.context.router.push('/test')}>
								<div className="list__item__title">Go to /test</div>
							</OnsListItem>
              <OnsListItem tappable modifier="chevron" onClick={() => OnsAlertDialog.show(TestDialog)}>
                <div className="list__item__title">Open "Warning!" alert</div>
              </OnsListItem>
						</OnsList>
					</OnsCarouselItem>
          <OnsCarouselItem style={{backgroundColor: 'green'}}>
            <div className="content-padded">
  						Another page with button and green bg
              <OnsButton modifier="large--cta">I'm a button</OnsButton>
            </div>
					</OnsCarouselItem>
				</OnsCarousel>
			</div>
		);
	}
}

class PageB extends OnsPage {
	renderToolbar() {
		return (
			<OnsToolbar>
				<div className="left"><OnsBackButton>Назад</OnsBackButton></div>
				<div className="center">Other toolbar</div>
			</OnsToolbar>
		);
	}

	renderContent() {
		return (
			<div className="content-padded">
				Another page.
        Navigation uses Browser Histor. So, just "back" in a browser to return ;)
			</div>
		);
	}
}

class PageSidebar extends OnsPage {
	renderToolbar() {
		return (
			<OnsToolbar>
				Sidebar
			</OnsToolbar>
		);
	}

	renderContent() {
		return (
      <OnsList>
        <OnsListItem tappable modifier="chevron">
          <div className="list__item__title">Ho-ho</div>
        </OnsListItem>
        <OnsListItem tappable modifier="chevron">
          <div className="list__item__title">Ha-ha</div>
        </OnsListItem>
      </OnsList>
		);
	}
}


module.exports = (
	<OnsSplitter>
		<OnsSplitterContent>
			<Router history={browserHistory}
				render={props => <OnsNavigatorContext {...props}/>}>
				<Route path="/" component={PageA} flat>
					<Route path="/test" component={PageB} />
				</Route>
			</Router>
		</OnsSplitterContent>
		<OnsSplitterSide side="left" width="230px" swipeable collapse="(max-width: 500px)">
			<PageSidebar style={{borderRight: '1px solid #aaa'}} />
		</OnsSplitterSide>
	</OnsSplitter>
);
