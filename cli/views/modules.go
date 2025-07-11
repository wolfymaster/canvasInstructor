package views

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/api"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/logger"
)

type ModulesView struct {
	modules  []api.Module
	selected int
	err      error
}

func NewModulesView() *ModulesView {
	log := logger.With("component", "modules_view")
	log.Info("Creating new modules view")
	return &ModulesView{
		modules:  []api.Module{},
		selected: 0,
	}
}

func (v *ModulesView) Init() tea.Cmd {
	log := logger.With("component", "modules_view")
	log.Info("Initializing modules view")
	return v.fetchModules
}

func (v *ModulesView) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	log := logger.With("component", "modules_view")

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "up", "k":
			if v.selected > 0 {
				v.selected--
			}
		case "down", "j":
			if v.selected < len(v.modules)-1 {
				v.selected++
			}
		case "enter":
			if len(v.modules) > 0 {
				selectedModule := v.modules[v.selected]
				log.Info("Selected module",
					"module_id", selectedModule.ID,
					"module_name", selectedModule.Name)
				return v, func() tea.Msg {
					return ModuleSelectedMsg{Module: selectedModule}
				}
			}
		case "esc":
			log.Info("Returning to home view")
			return v, func() tea.Msg {
				return HomeView{}
			}
		case "q", "ctrl+c":
			return v, tea.Quit
		}
	case modulesMsg:
		log.Info("Received modules", "count", len(msg))
		v.modules = msg
	case errMsg:
		log.Error("Error occurred", "error", msg)
		v.err = msg
	}

	return v, nil
}

func (v *ModulesView) View() string {
	if v.err != nil {
		return fmt.Sprintf("Error: %v\n\nPress esc to go back, q to quit.", v.err)
	}

	if len(v.modules) == 0 {
		return "Loading modules...\n\nPress esc to go back, q to quit."
	}

	s := "Course Modules\n"
	s += "==============\n\n"
	s += "Select a module to view its contents:\n\n"

	for i, module := range v.modules {
		cursor := "  "
		if v.selected == i {
			cursor = "> "
		}
		s += fmt.Sprintf("%s%s\n", cursor, module.Name)
	}

	s += "\nNavigation: ↑/k (up), ↓/j (down), Enter (select), Esc (back), q (quit)"
	return s
}

func (v *ModulesView) fetchModules() tea.Msg {
	log := logger.With("component", "modules_view", "action", "fetch_modules")
	log.Info("Fetching modules from API")

	port := os.Getenv("PORT")
	courseId := os.Getenv("COURSE_ID")
	client := api.NewClient(fmt.Sprintf("http://localhost:%s", port), courseId)
	modules, err := client.GetModules()
	if err != nil {
		log.Error("Failed to fetch modules", "error", err)
		return errMsg(err)
	}
	return modulesMsg(modules)
}

// Message types
type modulesMsg []api.Module
type errMsg error

type ModuleSelectedMsg struct {
	Module api.Module
}

type NavigateToHomeMsg struct{}
