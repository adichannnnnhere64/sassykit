<?php

declare(strict_types=1);

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Module\Kanban\Actions\CreateCard;
use Module\Kanban\DTOs\CardData;
use Module\Kanban\Models\Card;
use Module\Kanban\Models\Column;

final class BoardPasteGenerator extends Controller
{
    public function __invoke(Request $request): RedirectResponse|Response
    {
        $request->validate([
            'content' => 'required|string|min:1',
            'board_id' => 'nullable|exists:boards,id',
            'column_id' => 'nullable',
        ]);

        $textareaContent = $request->input('content');
        $boardId = $request->input('board_id');
        $columnId = $request->input('column_id');

        // Parse the textarea content
        $parsedSections = $this->parseTextareaContent($textareaContent);

        if ($parsedSections->isEmpty()) {
            return back()->withErrors(['textarea_content' => 'No valid sections found to parse.']);
        }

        // Process each parsed section
        $createdCards = collect();

        /* dd($parsedSections); */

        foreach ($parsedSections as $section) {
            try {
                // Create CardData DTO for each section
                $cardData = [
                    'title' => $section['title'],
                    'content' => $section['content'],
                    'board_id' => $boardId,
                    'column_id' => $columnId,
                    // Add other fields as needed
                    'position' => $createdCards->count() + 1,
                    /* 'user_id' => auth()->id(), */
                ];
                /* dd($cardData); */

                // Create the card using your existing action
                $card = app(CreateCard::class)->handle($cardData);
                $createdCards->push($card);

            } catch (Exception $e) {
                // Log error but continue with other sections
                logger()->error('Failed to create card from parsed section', [
                    'section' => $section,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($createdCards->isEmpty()) {
            return back()->withErrors(['general' => 'Failed to create any cards from the provided content.']);
        }

        // Return success response
        return back()->with([
            'success' => "Successfully created {$createdCards->count()} cards from parsed content.",
            'created_cards' => $createdCards->pluck('id')->toArray(),
        ]);
    }

    /**
     * Get preview of parsed content without creating cards
     */
    public function preview(Request $request): Response
    {
        $request->validate([
            'textarea_content' => 'required|string|min:10',
        ]);

        $textareaContent = $request->input('textarea_content');
        $parsedSections = $this->parseTextareaContent($textareaContent);

        return Inertia::render('Kanban/PastePreview', [
            'sections' => $parsedSections,
            'total_sections' => $parsedSections->count(),
            'total_words' => $parsedSections->sum('word_count'),
            'total_characters' => $parsedSections->sum('char_count'),
        ]);
    }

    public function generate($id, $column_id)
    {
        return Inertia::render('modules/kanban/modals/board-generator', [
            'column_id' => $column_id ,
            'board_id' => $id,
        ]);
    }

    /**
     * Parse textarea content into title/content sections
     */
    private function parseTextareaContent(string $text): Collection
    {
        return $this->parseWithRegex($text);
    }

    /**
     * Parse using regex approach (most robust)
     */
    private function parseWithRegex(string $text): Collection
    {
        $pattern = '/title:\s*(.+?)\s*content:\s*(.+?)(?=title:|$)/s';
        preg_match_all($pattern, $text, $matches, PREG_SET_ORDER);

        $result = collect();

        foreach ($matches as $match) {
            $title = mb_trim($match[1]);
            $content = mb_trim($match[2]);

            // Skip empty sections
            if (empty($title) || empty($content)) {
                continue;
            }

            $result->push([
                'title' => $title,
                'content' => $content,
                'word_count' => str_word_count($content),
                'char_count' => mb_strlen($content),
            ]);
        }

        return $result;
    }

    /**
     * Alternative parsing method - line by line
     */
    private function parseLineByLine(string $text): Collection
    {
        $lines = explode("\n", $text);
        $result = collect();
        $current = null;

        foreach ($lines as $line) {
            $line = mb_trim($line);

            if (empty($line)) {
                continue;
            }

            if (str_starts_with($line, 'title:')) {
                // Save previous entry if exists
                if ($current && isset($current['title']) && isset($current['content'])) {
                    $result->push($current);
                }

                // Start new entry
                $current = [
                    'title' => mb_trim(mb_substr($line, 6)),
                    'content' => '',
                ];
            } elseif (str_starts_with($line, 'content:')) {
                if ($current) {
                    $current['content'] = mb_trim(mb_substr($line, 8));
                }
            } elseif ($current && isset($current['content'])) {
                // Continue content on next line
                $current['content'] .= ' '.$line;
            }
        }

        // Add the last entry
        if ($current && isset($current['title']) && isset($current['content'])) {
            $result->push($current);
        }

        return $result;
    }
}
