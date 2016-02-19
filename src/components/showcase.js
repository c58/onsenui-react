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

/*
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
}*/


//////////////////////////////////////////////////////
let _autorized = true;



class AppMain extends React.Component {
	renderAuthorized() {
		return (
			<OnsSplitter>
				<OnsSplitterContent>
					{this.props.children}
				</OnsSplitterContent>
				<OnsSplitterSide side="left" width="230px" swipeable collapse="(max-width: 500px)">
					<PageSidebar style={{borderRight: '1px solid #aaa'}} />
				</OnsSplitterSide>
			</OnsSplitter>
		);
	}

	renderUnathtorized() {
		return (
			<div>
				{this.props.children}
			</div>
		);
	}

	render() {
		return _autorized
			? this.renderAuthorized()
			: this.renderUnathtorized();
	}
}



class PageSidebar extends OnsPage {

	renderToolbar() {
		return (
			<OnsToolbar>
				<div className="left" style={{textAlign: 'center'}}>
					<OnsIcon icon="ion-person" size="40px" />
				</div>
				<div className="center" style={{textAlign: 'center'}}>
					Василий Иванов
				</div>
			</OnsToolbar>
		);
	}

	renderContent() {
		const { router } = this.context;
		return (
      <OnsList>
        <OnsListItem tappable modifier="chevron" onClick={() => router.push('/timetable')}>
          <div className="list__item__title">Мое расписание</div>
        </OnsListItem>
        <OnsListItem tappable modifier="chevron" onClick={() => router.push('/select/group')}>
          <div className="list__item__title">Группы</div>
        </OnsListItem>
				<OnsListItem tappable modifier="chevron" onClick={() => router.push('/settings')}>
          <div className="list__item__title">Настройки</div>
        </OnsListItem>

				<OnsListHeader>ИЗБРАННЫЕ</OnsListHeader>
				<OnsListItem tappable modifier="chevron" onClick={() => router.push('/timetable/group/ФИИТ-2')}>
					<div className="list__item__title">ФИИТ-2</div>
				</OnsListItem>
				<OnsListItem tappable modifier="chevron" onClick={() => router.push('/timetable/group/КБ-401')}>
					<div className="list__item__title">КБ-401</div>
				</OnsListItem>
      </OnsList>
		);
	}
}

class TimetablePage extends OnsPage {

	renderToolbar() {
		const { router } = this.context;
		return (
			<OnsToolbar>
				<div className="center">{this.props.params.groupId}</div>
				<div className="right">
					<OnsToolbarButton onClick={() => router.push(`/timetable/group/${this.props.params.groupId}/info`)}>
						<OnsIcon icon="ion-gear-b" size="25px" />
					</OnsToolbarButton>
					<OnsToolbarButton onClick={() => router.push(`/timetable/group/${this.props.params.groupId}/event/new/edit`)}>
						<OnsIcon icon="ion-plus" size="25px" />
					</OnsToolbarButton>
				</div>
			</OnsToolbar>
		);
	}

	renderDay(dayNum) {
		const { router } = this.context;
		const { pathname } = this.context.location

		return (
			<OnsCarouselItem>
				<OnsList>
					<OnsListHeader>
						Понедельник, {dayNum} февраля
					</OnsListHeader>
					<OnsListItem tappable
						onClick={() => router.push(`${pathname}/event/1`)}>
						<div className="center">Матанализ</div>
						<div className="left">9:00</div>
					</OnsListItem>
					<OnsListItem tappable
						onClick={() => router.push(`${pathname}/event/2`)}>
						<div className="center">История</div>
						<div className="left">10:40</div>
					</OnsListItem>
					<OnsListItem tappable
						onClick={() => router.push(`${pathname}/event/3`)}>
						<div className="center">Методы построения сеток</div>
						<div className="left">11:30</div>
					</OnsListItem>
					<OnsListItem tappable
						onClick={() => router.push(`${pathname}/event/4`)}>
						<div className="center">Функциональный анализ</div>
						<div className="left">13:00</div>
					</OnsListItem>
				</OnsList>
			</OnsCarouselItem>
		);
	}

	renderContent() {
		return (
			<OnsCarousel swipeable overscrollable autoScroll fullscreen>
				{this.renderDay(23)}
				{this.renderDay(24)}
				{this.renderDay(25)}
				{this.renderDay(26)}
			</OnsCarousel>
		);
	}
}



class GroupDetailsPage extends OnsPage {

	renderToolbar() {
		const { router } = this.context;
		return (
			<OnsToolbar>
				<div className="left"><OnsBackButton /></div>
				<div className="center">
					О группе
				</div>
				<div className="right">
					<OnsToolbarButton onClick={() => router.push(`${pathname}/edit`)}>
						Изменить
					</OnsToolbarButton>
				</div>
			</OnsToolbar>
		);
	}

	renderContent() {
		return (
			<OnsList>
				<OnsListHeader></OnsListHeader>
				<OnsListItem>
					<div className="center">Название</div>
					<div className="right">{this.props.params.groupId}</div>
				</OnsListItem>
				<OnsListItem>
					<div className="center">Курс</div>
					<div className="right">2</div>
				</OnsListItem>
				<OnsListHeader>ПОЛЬЗОВАТЕЛИ</OnsListHeader>
				<OnsListItem>
					<div className="center">Василий Иванов</div>
					<div className="left"><OnsIcon icon="ion-person" size="40px" /></div>
				</OnsListItem>
				<OnsListItem>
					<div className="center">Петр Васильев</div>
					<div className="left"><OnsIcon icon="ion-person" size="40px" /></div>
				</OnsListItem>
			</OnsList>
		);
	}
}



class EventDetailsPage extends OnsPage {

	renderToolbar() {
		const { router } = this.context;
		const { pathname } = this.context.location;
		return (
			<OnsToolbar>
				<div className="left"><OnsBackButton /></div>
				<div className="center">О паре</div>
				<div className="right">
					<OnsToolbarButton onClick={() => router.push(`${pathname}/edit`)}>
						Изменить
					</OnsToolbarButton>
				</div>
			</OnsToolbar>
		);
	}

	renderContent() {
		return (
			<OnsList>
				<OnsListHeader></OnsListHeader>
				<OnsListItem>
					<div className="center">Математический анализ</div>
				</OnsListItem>
				<OnsListItem>
					<div className="left">
						<OnsIcon icon="ion-ios-location" size="30px" />
					</div>
					<div className="center">632</div>
				</OnsListItem>
				<OnsListItem>
					<div className="left">
						<OnsIcon icon="ion-person" size="30px" />
					</div>
					<div className="center">Васлий Петров</div>
				</OnsListItem>
				<OnsListItem>
					<div className="left">
						<OnsIcon icon="ion-ios-people" size="30px" />
					</div>
					<div className="center">ФТ-201, ФИИТ-2</div>
				</OnsListItem>

				<OnsListHeader>ЗАДАНИЯ</OnsListHeader>
				<OnsListItem>
					<div className="center">n132 до 24.03</div>
				</OnsListItem>
				<OnsListItem>
					<div className="center">n432 до 10.05</div>
				</OnsListItem>
			</OnsList>
		);
	}
}



class EventEditorPage extends OnsPage {
	renderToolbar() {
		const { router } = this.context;
		return (
			<OnsToolbar>
				<div className="left"><OnsBackButton /></div>
				<div className="center">Редактор</div>
				<div className="right">
					<OnsToolbarButton onClick={() => router.push(`/timetable/group/ФИИТ-2`)}>
						Сохр.
					</OnsToolbarButton>
				</div>
			</OnsToolbar>
		);
	}

	renderContent() {
		const { router, location } = this.context;
		const { pathname } = location;
		return (
			<OnsList>
				<OnsListHeader />
				<OnsListItem modifier="chevron" tappable
					onClick={() => router.push(`${pathname}/type`)}>
					<div className="center">Тип пары</div>
					<div className="right">Лекция</div>
				</OnsListItem>

				<OnsListHeader />
				<OnsListItem modifier="chevron" tappable
					onClick={() => router.push(`${pathname}/subject`)}>
					<div className="center">
						<div className="list__item__title">Предмет</div>
						<div className="list__item__subtitle">Математический анализ</div>
					</div>
				</OnsListItem>
				<OnsListItem modifier="chevron" tappable
					onClick={() => router.push(`${pathname}/user`)}>
					<div className="center">
						<div className="list__item__title">Преподаватели</div>
						<div className="list__item__subtitle">Василий Иваноа, Тамара Ивановна</div>
					</div>
				</OnsListItem>
				<OnsListItem modifier="chevron" tappable
					onClick={() => router.push(`${pathname}/place`)}>
					<div className="center">
						<div className="list__item__title">Аудитории</div>
						<div className="list__item__subtitle">632а</div>
					</div>
				</OnsListItem>
				<OnsListItem modifier="chevron" tappable
					onClick={() => router.push(`${pathname}/group`)}>
					<div className="center">
						<div className="list__item__title">Группы</div>
						<div className="list__item__subtitle">ФИИТ-2</div>
					</div>
				</OnsListItem>

				<OnsListHeader />
				<OnsListItem modifier="chevron" tappable
					onClick={() => router.push(`${pathname}/dow`)}>
					<div className="center">
						<div className="list__item__title">День недели</div>
					</div>
					<div className="right">Пн</div>
				</OnsListItem>
				<OnsListItem modifier="chevron" tappable
					onClick={() => router.push(`${pathname}/time/start`)}>
					<div className="center">
						<div className="list__item__title">Время начала</div>
					</div>
					<div className="right">13:40</div>
				</OnsListItem>
				<OnsListItem modifier="chevron" tappable
					onClick={() => router.push(`${pathname}/time/end`)}>
					<div className="center">
						<div className="list__item__title">Время конца</div>
					</div>
					<div className="right">15:20</div>
				</OnsListItem>
				<OnsListItem modifier="chevron" tappable
					onClick={() => router.push(`${pathname}/repeat`)}>
					<div className="center">
						<div className="list__item__title">Повтор</div>
					</div>
					<div className="right">По четным</div>
				</OnsListItem>

				<OnsListHeader />
				<OnsListItem modifier="chevron" tappable
					onClick={() => router.push(`${pathname}/group-part`)}>
					<div className="center">
						<div className="list__item__title">Часть группы</div>
					</div>
					<div className="right">Вторая</div>
				</OnsListItem>
			</OnsList>
		);
	}
}



class EventTypeEditorPage extends OnsPage {
	renderToolbar() {
		const { router } = this.context;
		return (
			<OnsToolbar>
				<div className="left"><OnsBackButton /></div>
				<div className="center">Тип пары</div>
			</OnsToolbar>
		);
	}

	renderContent() {
		const { router, location } = this.context;
		const { pathname } = location;
		return (
			<OnsList>
				<OnsListHeader />
				{['Лекция', 'Практика', 'Зачет', 'Экзамен'].map((x, i) =>
					<OnsListItem key={i} tappable onClick={() => router.push(location.prevPath)}>
						<div className="center">{x}</div>
					</OnsListItem>
				)}
			</OnsList>
		);
	}
}



class EventSubjEditorPage extends OnsPage {
	renderToolbar() {
		const { router } = this.context;
		return (
			<OnsToolbar>
				<div className="left"><OnsBackButton /></div>
				<div className="center">Предмет</div>
				<div className="right">
					<OnsToolbarButton onClick={() => router.push(`/timetable/group/${this.props.params.groupId}/event/new/edit`)}>
						<OnsIcon icon="ion-plus" size="25px" />
					</OnsToolbarButton>
				</div>
			</OnsToolbar>
		);
	}

	renderContent() {
		const { router, location } = this.context;
		const { pathname } = location;
		return (
			<div>
				<OnsToolbar inline raw>
					<div className="navigation-bar__center">
						<input type="search" className="search-input" style={{width: '96%', margin: '6px auto 6px auto'}} placeholder="Поиск" />
					</div>
				</OnsToolbar>
				<OnsList>
					{['Мат.ан', 'Мат экономика', 'Моделирование сплошных сред', 'Метеорология'].map((x, i) =>
						<OnsListItem key={i} tappable onClick={() => router.push(location.prevPath)}>
							<div className="center">{x}</div>
						</OnsListItem>
					)}
				</OnsList>
				<div className="content-padded">
					<OnsButton modifier="large--cta">
						Добавить предмет
					</OnsButton>
				</div>
			</div>
		);
	}
}


class EventPlaceEditorPage extends OnsPage {
	renderToolbar() {
		const { router } = this.context;
		return (
			<OnsToolbar>
				<div className="left"><OnsBackButton /></div>
				<div className="center">Аудитории</div>
				<div className="right">
					<OnsToolbarButton>
						<OnsIcon icon="ion-plus" size="25px" />
					</OnsToolbarButton>
				</div>
			</OnsToolbar>
		);
	}

	renderContent() {
		const { router, location } = this.context;
		const { pathname } = location;
		return (
			<div>
				<OnsToolbar inline raw>
					<div className="navigation-bar__center">
						<input type="search" className="search-input" style={{width: '96%', margin: '6px auto 6px auto'}} placeholder="Поиск" />
					</div>
				</OnsToolbar>
				<OnsList>
					{['632', '625', '659', '354'].map((x, i) =>
						<OnsListItem key={i} tappable onClick={() => router.push(location.prevPath)}>
							<div className="center">{x}</div>
						</OnsListItem>
					)}
				</OnsList>
				<div className="content-padded">
					<OnsButton modifier="large--cta">
						Добавить аудиторию
					</OnsButton>
				</div>
			</div>
		);
	}
}


class EventUserEditorPage extends OnsPage {
	renderToolbar() {
		const { router } = this.context;
		return (
			<OnsToolbar>
				<div className="left"><OnsBackButton /></div>
				<div className="center">Преподаватели</div>
				<div className="right">
					<OnsToolbarButton>
						<OnsIcon icon="ion-plus" size="25px" />
					</OnsToolbarButton>
				</div>
			</OnsToolbar>
		);
	}

	renderContent() {
		const { router, location } = this.context;
		const { pathname } = location;
		return (
			<div>
				<OnsToolbar inline raw>
					<div className="navigation-bar__center">
						<input type="search" className="search-input" style={{width: '96%', margin: '6px auto 6px auto'}} placeholder="Поиск" />
					</div>
				</OnsToolbar>
				<OnsList>
					{['Василий Петрович', 'Анастасия Федоровна'].map((x, i) =>
						<OnsListItem key={i} tappable onClick={() => router.push(location.prevPath)}>
							<label className="checkbox checkbox--noborder checkbox--list-item">
		            <input className="checkbox__input checkbox--noborder__input" type="checkbox" checked="checked" />
		            <div className="checkbox__checkmark checkbox--noborder__checkmark checkbox--list-item__checkmark" />
		            {x}
		          </label>
						</OnsListItem>
					)}
				</OnsList>
				<div className="content-padded">
					<OnsButton modifier="large--cta">
						Добавить преподавателя
					</OnsButton>
				</div>
			</div>
		);
	}
}

class EventGroupEditorPage extends OnsPage { }


class CreateUniversityPage extends OnsPage { }
class CreateSubjectPage extends OnsPage { }
class CreateFacultyPage extends OnsPage { }
class CreatePlacePage extends OnsPage { }
class CreateUserPage extends OnsPage { }
class CreateGroupPage extends OnsPage { }

class LoginPage extends OnsPage { }
class SettingsPage extends OnsPage { }
class SelectUniversityPage extends OnsPage { }
class SelectFacultyPage extends OnsPage { }
class SelectGroupPage extends OnsPage { }
class EventDowEditorPage extends OnsPage { }
class EventTimeStartEditorPage extends OnsPage { }
class EventTimeEndEditorPage extends OnsPage { }
class EventDateEditorPage extends OnsPage { }
class EventRepeatEditorPage extends OnsPage { }
class EventGroupPartEditorPage extends OnsPage { }



module.exports = (
	<Router history={browserHistory} render={props => <OnsNavigatorContext {...props}/>}>
		<Route path="/" component={AppMain}>
			<Route path="/login" component={LoginPage} />

			<Route path="/settings" component={SettingsPage}>
				<Route path="select/group" component={SelectUniversityPage} flat>
					<Route path="create" component={CreateUniversityPage} />
					<Route path=":uniId" component={SelectFacultyPage}>
						<Route path="create" component={CreateFacultyPage} />
						<Route path=":facultyId" component={SelectGroupPage}>
							<Route path="create" component={CreateGroupPage} />
						</Route>
					</Route>
				</Route>
			</Route>

			<Route path="/select/group" component={SelectUniversityPage} flat>
				<Route path="create" component={CreateUniversityPage} />
				<Route path=":uniId" component={SelectFacultyPage}>
					<Route path="create" component={CreateFacultyPage} />
					<Route path=":facultyId" component={SelectGroupPage}>
						<Route path="create" component={CreateGroupPage} />
					</Route>
				</Route>
			</Route>

			<Route path="/timetable(/group/:groupId)" component={TimetablePage} flat>
				<Route path="info" component={GroupDetailsPage} />
				<Route path="event/:eventId" component={EventDetailsPage}>
					<Route path="edit" component={EventEditorPage}>
						<Route path="type" component={EventTypeEditorPage} />
						<Route path="subject" component={EventSubjEditorPage}>
							<Route path="create" component={CreateSubjectPage} />
						</Route>
						<Route path="place" component={EventPlaceEditorPage}>
							<Route path="create" component={CreatePlacePage} />
						</Route>
						<Route path="user" component={EventUserEditorPage}>
							<Route path="create" component={CreateUserPage} />
						</Route>
						<Route path="group" component={EventGroupEditorPage}>
							<Route path="create" component={CreateGroupPage} />
						</Route>
						<Route path="dow" component={EventDowEditorPage} />
						<Route path="time/start" component={EventTimeStartEditorPage} />
						<Route path="time/end" component={EventTimeEndEditorPage} />
						<Route path="date" component={EventDateEditorPage} />
						<Route path="repeat" component={EventRepeatEditorPage} />
						<Route path="group-part" component={EventGroupPartEditorPage} />
					</Route>
				</Route>
			</Route>
		</Route>
	</Router>
);
