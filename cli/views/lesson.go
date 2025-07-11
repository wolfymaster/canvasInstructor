package views

import (
	"fmt"
	"os"
	"time"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/api"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/logger"
)

type LessonView struct {
	Lesson   api.ModuleNode
	Module   api.Module
	selected int
	err      error
	// For date input
	dateInput     textinput.Model
	dateInputMode bool
}

type LessonAction int

const (
	ActionPublish LessonAction = iota
	ActionUnpublish
	ActionSetDueDate
)

var actions = []struct {
	name string
	key  LessonAction
}{
	{"Publish", ActionPublish},
	{"Unpublish", ActionUnpublish},
	{"Set Due Date", ActionSetDueDate},
}

func NewLessonView(lesson api.ModuleNode, module api.Module) *LessonView {
	log := logger.With(
		"component", "lesson_view",
		"lesson_id", lesson.Lesson.ID,
		"lesson_title", lesson.Lesson.Title,
	)
	log.Info("Creating new lesson view")

	// Create text input for date
	ti := textinput.New()
	ti.Placeholder = "YYYY-MM-DD"
	ti.Focus()
	ti.CharLimit = 10
	ti.Width = 20
	ti.SetValue(time.Now().Format("2006-01-02"))

	return &LessonView{
		Lesson:        lesson,
		Module:        module,
		selected:      0,
		dateInput:     ti,
		dateInputMode: false,
	}
}

func (v *LessonView) Init() tea.Cmd {
	return textinput.Blink
}

func (v *LessonView) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	log := logger.With(
		"component", "lesson_view",
		"lesson_id", v.Lesson.Lesson.ID,
		"lesson_title", v.Lesson.Lesson.Title,
	)

	var cmd tea.Cmd

	if v.dateInputMode {
		switch msg := msg.(type) {
		case tea.KeyMsg:
			switch msg.String() {
			case "enter":
				// Validate date format
				if _, err := time.Parse("2006-01-02", v.dateInput.Value()); err != nil {
					v.err = fmt.Errorf("invalid date format. Use YYYY-MM-DD")
					return v, nil
				}
				v.dateInputMode = false
				return v, func() tea.Msg {
					return DateSetMsg{
						Lesson: v.Lesson,
						Date:   v.dateInput.Value(),
					}
				}
			case "esc":
				v.dateInputMode = false
				return v, nil
			}
		}

		v.dateInput, cmd = v.dateInput.Update(msg)
		return v, cmd
	}

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "up", "k":
			if v.selected > 0 {
				v.selected--
			}
		case "down", "j":
			if v.selected < len(actions)-1 {
				v.selected++
			}
		case "enter":
			action := actions[v.selected].key
			log.Info("Selected action", "action", actions[v.selected].name)

			switch action {
			case ActionPublish:
				return v, func() tea.Msg {
					return PublishLessonMsg{Lesson: v.Lesson}
				}
			case ActionUnpublish:
				return v, func() tea.Msg {
					return UnpublishLessonMsg{Lesson: v.Lesson}
				}
			case ActionSetDueDate:
				v.dateInputMode = true
				v.dateInput.Focus()
				return v, textinput.Blink
			}
		case "esc":
			log.Info("Returning to module view")
			return v, func() tea.Msg {
				return ModuleSelectedMsg{Module: v.Module}
			}
		}
	case errMsg:
		log.Error("Error occurred", "error", msg)
		v.err = msg
	case PublishLessonMsg:
		port := os.Getenv("PORT")
		courseId := os.Getenv("COURSE_ID")
		client := api.NewClient(fmt.Sprintf("http://localhost:%s", port), courseId)
		err := client.UpdateLesson(v.Module.ID, api.UpdateLessonRequest{
			LessonID: v.Lesson.Lesson.ID,
			Action:   "publish",
		})
		if err != nil {
			v.err = err
			return v, nil
		}
		return v, func() tea.Msg {
			return ModuleSelectedMsg{Module: v.Module}
		}
	case UnpublishLessonMsg:
		port := os.Getenv("PORT")
		courseId := os.Getenv("COURSE_ID")
		client := api.NewClient(fmt.Sprintf("http://localhost:%s", port), courseId)
		err := client.UpdateLesson(v.Module.ID, api.UpdateLessonRequest{
			LessonID: v.Lesson.Lesson.ID,
			Action:   "unpublish",
		})
		if err != nil {
			v.err = err
			return v, nil
		}
		return v, func() tea.Msg {
			return ModuleSelectedMsg{Module: v.Module}
		}
	case DateSetMsg:
		port := os.Getenv("PORT")
		courseId := os.Getenv("COURSE_ID")
		client := api.NewClient(fmt.Sprintf("http://localhost:%s", port), courseId)
		err := client.UpdateLesson(v.Module.ID, api.UpdateLessonRequest{
			LessonID: v.Lesson.Lesson.ID,
			Action:   "setDueDate",
			DueDate:  msg.Date,
		})
		if err != nil {
			v.err = err
			return v, nil
		}
		return v, func() tea.Msg {
			return ModuleSelectedMsg{Module: v.Module}
		}
	}

	return v, nil
}

func (v *LessonView) View() string {
	if v.err != nil {
		return fmt.Sprintf("Error: %v", v.err)
	}

	if v.dateInputMode {
		return fmt.Sprintf(
			"Set due date for %s\n\n"+
				"Enter date (YYYY-MM-DD):\n%s\n\n"+
				"Press enter to confirm, esc to cancel",
			v.Lesson.Lesson.Title,
			v.dateInput.View(),
		)
	}

	s := fmt.Sprintf("Lesson: %s\n\n", v.Lesson.Lesson.Title)
	s += "Select an action:\n\n"
	for i, action := range actions {
		cursor := " "
		if v.selected == i {
			cursor = ">"
		}
		s += fmt.Sprintf("%s %s\n", cursor, action.name)
	}
	s += "\nPress esc to go back, q to quit."
	return s
}

type PublishLessonMsg struct {
	Lesson api.ModuleNode
}

type UnpublishLessonMsg struct {
	Lesson api.ModuleNode
}

type DateSetMsg struct {
	Lesson api.ModuleNode
	Date   string
}
