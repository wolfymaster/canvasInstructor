package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/wolfy/code/fullstack/canvasInstructor/cli/logger"
)

type Client struct {
	baseURL string
	client  *http.Client
	log     *slog.Logger
}

const courseId = "1212"

func NewClient(baseURL string) *Client {
	log := logger.With("component", "api_client", "base_url", baseURL)
	log.Info("Creating new API client")

	return &Client{
		baseURL: baseURL,
		client:  &http.Client{},
		log:     log,
	}
}

func (c *Client) GetModules() ([]Module, error) {
	url := fmt.Sprintf("%s/course/%s/modules", c.baseURL, courseId)
	log := c.log.With("action", "get_modules", "url", url)
	log.Info("Fetching modules")

	resp, err := c.client.Get(url)
	if err != nil {
		log.Error("Failed to fetch modules", "error", err)
		return nil, fmt.Errorf("failed to fetch modules: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Error("Unexpected status code", "status", resp.StatusCode)
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var result struct {
		Status string   `json:"status"`
		Data   []Module `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Error("Failed to decode response", "error", err)
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	log.Info("Successfully fetched modules", "count", len(result.Data))
	return result.Data, nil
}

func (c *Client) GetModuleItems(moduleId int) ([]ModuleNode, error) {
	url := fmt.Sprintf("%s/course/%s/modules/%d", c.baseURL, courseId, moduleId)
	log := c.log.With(
		"action", "get_module_items",
		"url", url,
		"module_id", moduleId,
	)
	log.Info("Fetching module items")

	resp, err := c.client.Get(url)
	if err != nil {
		log.Error("Failed to fetch module items", "error", err)
		return nil, fmt.Errorf("failed to fetch module items: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Error("Unexpected status code", "status", resp.StatusCode)
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var result struct {
		Status string       `json:"status"`
		Data   []ModuleNode `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Error("Failed to decode response", "error", err)
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	log.Info("Successfully fetched module items", "count", len(result.Data))
	return result.Data, nil
}

type Module struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Lesson struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Type  string `json:"type"`
}

type ModuleNode struct {
	Lesson   Lesson   `json:"item"`
	Children []Lesson `json:"children"`
}

type UpdateLessonRequest struct {
	LessonID int    `json:"lessonId"`
	Action   string `json:"action"`
	DueDate  string `json:"dueDate,omitempty"`
}

func (c *Client) UpdateLesson(moduleID int, req UpdateLessonRequest) error {
	url := fmt.Sprintf("%s/course/%s/modules/%d/lesson", c.baseURL, courseId, moduleID)
	log := c.log.With(
		"action", "update_lesson",
		"url", url,
		"module_id", moduleID,
		"lesson_id", req.LessonID,
		"action", req.Action,
	)
	log.Info("Updating lesson")

	jsonData, err := json.Marshal(req)
	if err != nil {
		log.Error("Failed to marshal request", "error", err)
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := c.client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Error("Failed to update lesson", "error", err)
		return fmt.Errorf("failed to update lesson: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Error("Unexpected status code", "status", resp.StatusCode)
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	log.Info("Successfully updated lesson")
	return nil
}
