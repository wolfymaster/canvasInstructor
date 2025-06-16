package views

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/api"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/logger"
)

type ModuleView struct {
	module   api.Module
	lessons  []api.ModuleNode
	selected int
	err      error
}

func NewModuleView(module api.Module) *ModuleView {
	log := logger.With("component", "module_view", "module_name", module.Name)
	log.Info("Creating new module view")
	return &ModuleView{
		module:   module,
		lessons:  []api.ModuleNode{},
		selected: 0,
	}
}

func (v *ModuleView) Init() tea.Cmd {
	log := logger.With("component", "module_view", "module_name", v.module.Name)
	log.Info("Initializing module view")
	return v.fetchLessons
}

func (v *ModuleView) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	log := logger.With("component", "module_view", "module_name", v.module.Name)

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "up", "k":
			if v.selected > 0 {
				v.selected--
			}
		case "down", "j":
			if v.selected < len(v.lessons)-1 {
				v.selected++
			}
		case "enter":
			if len(v.lessons) > 0 {
				selectedLesson := v.lessons[v.selected]
				log.Info("Selected lesson",
					"lesson_id", selectedLesson.Lesson.ID,
					"lesson_title", selectedLesson.Lesson.Title,
					"lesson_type", selectedLesson.Lesson.Type)
				return v, func() tea.Msg {
					return LessonSelectedMsg{
						Lesson: selectedLesson,
						Module: v.module,
					}
				}
			}
		case "esc":
			log.Info("Returning to home view")
			return v, func() tea.Msg {
				return ModulesView{}
			}
		}
	case lessonsMsg:
		log.Info("Received lessons", "count", len(msg))
		v.lessons = msg
	case errMsg:
		log.Error("Error occurred", "error", msg)
		v.err = msg
	}

	return v, nil
}

func (v *ModuleView) View() string {
	if v.err != nil {
		return fmt.Sprintf("Error: %v", v.err)
	}

	if len(v.lessons) == 0 {
		return fmt.Sprintf("Loading lessons for module: %s...", v.module.Name)
	}

	s := fmt.Sprintf("Module: %s\n\n", v.module.Name)
	s += "Select a lesson:\n\n"
	for i, lesson := range v.lessons {
		cursor := " "
		if v.selected == i {
			cursor = ">"
		}
		s += fmt.Sprintf("%s %s (%s)\n", cursor, lesson.Lesson.Title, lesson.Lesson.Type)
	}
	s += "\nPress esc to go back, q to quit."
	return s
}

func (v *ModuleView) fetchLessons() tea.Msg {
	log := logger.With(
		"component", "module_view",
		"action", "fetch_lessons",
		"module_name", v.module.Name,
	)
	log.Info("Fetching lessons")

	port := os.Getenv("PORT")
	client := api.NewClient(fmt.Sprintf("http://localhost:%s", port))
	lessons, err := client.GetModuleItems(v.module.ID)
	if err != nil {
		log.Error("Failed to fetch lessons", "error", err)
		return errMsg(err)
	}
	return lessonsMsg(lessons)
}

type lessonsMsg []api.ModuleNode

type LessonSelectedMsg struct {
	Lesson api.ModuleNode
	Module api.Module
}
