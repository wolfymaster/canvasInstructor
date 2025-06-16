package main

import (
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/logger"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/views"
)

type model struct {
	currentView tea.Model
}

func initialModel() model {
	log := logger.With("component", "main")
	log.Info("Initializing application")
	return model{
		currentView: views.NewHomeView(),
	}
}

func (m model) Init() tea.Cmd {
	return m.currentView.Init()
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	log := logger.With("component", "main")

	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == "ctrl+c" || msg.String() == "q" {
			log.Info("User requested exit")
			return m, tea.Quit
		}
	case views.HomeView:
		log.Info("Switching to home view")
		m.currentView = views.NewHomeView()
		return m, m.currentView.Init()
	case views.ModulesView:
		log.Info("Switching to modules view")
		m.currentView = views.NewModulesView()
		return m, m.currentView.Init()
	case views.EnrollmentsView:
		log.Info("Switching to enrollments view")
		m.currentView = views.NewEnrollmentView()
		return m, m.currentView.Init()
	case views.ModuleSelectedMsg:
		log.Info("Switching to module view", "module_name", msg.Module.Name)
		m.currentView = views.NewModuleView(msg.Module)
		return m, m.currentView.Init()
	case views.LessonSelectedMsg:
		log.Info("Switching to lesson view",
			"lesson_id", msg.Lesson.Lesson.ID,
			"lesson_title", msg.Lesson.Lesson.Title)
		m.currentView = views.NewLessonView(msg.Lesson, msg.Module)
		return m, m.currentView.Init()
	case views.EnrollmentSelectedMsg:
		log.Info("Enrollment selected", "student_name", msg.Enrollment.User.Name)
		// Handle enrollment selection - maybe show detailed view?
		// For now, staying on the same view
	}

	var cmd tea.Cmd
	m.currentView, cmd = m.currentView.Update(msg)
	return m, cmd
}

func (m model) View() string {
	return m.currentView.View()
}

func main() {
	log := logger.With("component", "main")
	log.Info("Starting Canvas Instructor CLI")

	p := tea.NewProgram(initialModel())
	if _, err := p.Run(); err != nil {
		logger.Logger.Error("Application error", "error", err)
		os.Exit(1)
	}
}
