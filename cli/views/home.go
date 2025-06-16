package views

import (
	"fmt"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/logger"
)

type MenuItem struct {
	Label       string
	Description string
	Action      string
}

type HomeView struct {
	menuItems []MenuItem
	selected  int
	err       error
}

func NewHomeView() *HomeView {
	log := logger.With("component", "home_view")
	log.Info("Creating new home view")

	menuItems := []MenuItem{
		{
			Label:       "List Modules",
			Description: "View and manage course modules",
			Action:      "modules",
		},
		{
			Label:       "Enrollments",
			Description: "View student enrollments and grades",
			Action:      "enrollments",
		},
		{
			Label:       "Quit",
			Description: "Exit the application",
			Action:      "quit",
		},
	}

	return &HomeView{
		menuItems: menuItems,
		selected:  0,
	}
}

func (v *HomeView) Init() tea.Cmd {
	log := logger.With("component", "home_view")
	log.Info("Initializing home view")
	return nil
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
			if v.selected < len(v.menuItems)-1 {
				v.selected++
			}
		case "enter":
			selectedItem := v.menuItems[v.selected]
			log.Info("Menu item selected", "action", selectedItem.Action, "label", selectedItem.Label)

			switch selectedItem.Action {
			case "modules":
				return v, func() tea.Msg {
					return ModulesView{}
				}
			case "enrollments":
				return v, func() tea.Msg {
					return EnrollmentsView{}
				}
			case "quit":
				return v, tea.Quit
			}
		case "q", "ctrl+c":
			return v, tea.Quit
		}
	}

	return v, nil
}

func (v *HomeView) View() string {
	s := "Canvas Instructor CLI\n"
	s += "====================\n\n"
	s += "Welcome! Choose an option:\n\n"

	for i, item := range v.menuItems {
		cursor := "  "
		if v.selected == i {
			cursor = "> "
		}

		s += fmt.Sprintf("%s%s (%s)\n", cursor, item.Label, item.Description)
	}

	s += "Navigation: ↑/k (up), ↓/j (down), Enter (select), q (quit)"
	return s
}
