package views

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/api"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/logger"
)

type HomeView struct {
	modules  []api.Module
	selected int
	err      error
}

func NewHomeView() *HomeView {
	log := logger.With("component", "home_view")
	log.Info("Creating new home view")
	return &HomeView{
		modules:  []api.Module{},
		selected: 0,
	}
}

func (v *HomeView) Init() tea.Cmd {
	log := logger.With("component", "home_view")
	log.Info("Initializing home view")
	return v.fetchModules
}

func (v *HomeView) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	log := logger.With("component", "home_view")

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

func (v *HomeView) View() string {
	if v.err != nil {
		return fmt.Sprintf("Error: %v", v.err)
	}

	if len(v.modules) == 0 {
		return "Welcome to Canvas Instructor CLI!\nFetching modules..."
	}

	s := "Select a module:\n\n"
	for i, module := range v.modules {
		cursor := " "
		if v.selected == i {
			cursor = ">"
		}
		s += fmt.Sprintf("%s %s\n", cursor, module.Name)
	}
	s += "\nPress q to quit."
	return s
}

func (v *HomeView) fetchModules() tea.Msg {
	log := logger.With("component", "home_view", "action", "fetch_modules")
	log.Info("Fetching modules from API")
	port := os.Getenv("PORT")
	client := api.NewClient(fmt.Sprintf("http://localhost:%s", port))
	modules, err := client.GetModules()
	if err != nil {
		log.Error("Failed to fetch modules", "error", err)
		return errMsg(err)
	}
	return modulesMsg(modules)
}

type modulesMsg []api.Module
type errMsg error

type ModuleSelectedMsg struct {
	Module api.Module
}
