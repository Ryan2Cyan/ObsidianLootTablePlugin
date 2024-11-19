import { Plugin, setIcon, Notice } from 'obsidian';

export default class LineConverterPlugin extends Plugin {
    async onload() {
        this.registerMarkdownCodeBlockProcessor('line', async (source, el, ctx) => {
            const convertedText = processLineBlock(source);

            // Create a code block container with the necessary classes
            const codeBlockEl = el.createEl('div', { cls: 'code-block is-loaded' });

            // Create the header for the code block (where buttons are placed)
            const codeBlockHeader = codeBlockEl.createEl('div', { cls: 'code-block-header' });

            // Create the copy button with the 'clickable-icon' class
            const copyButton = codeBlockHeader.createEl('div', { cls: 'copy-code-button clickable-icon' });
            setIcon(copyButton, 'copy');

            // Add event listener to copy the content to the clipboard
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(convertedText).then(() => {
                    // Provide feedback to the user
                    copyButton.addClass('mod-copied');
                    setTimeout(() => copyButton.removeClass('mod-copied'), 1500);

                    // Show a notification to the user
                    new Notice('Copied to clipboard!');
                });
            });

            // Obsidian automatically adds the "Edit this block" button, so no need to add it manually

            // Create the content area of the code block
            const codeBlockContent = codeBlockEl.createEl('div', { cls: 'code-block-content' });

            // Create the <pre> and <code> elements to display the converted text
            const preEl = codeBlockContent.createEl('pre');
            const codeEl = preEl.createEl('code');
            codeEl.setText(convertedText);

            // Append the code block to the element
            el.appendChild(codeBlockEl);
        });
    }
}

function processLineBlock(source: string): string {
    const lines = source.split('\n');
    const outputLines = [];
    let prevIndentLevel = 0;
    let listCounters: number[] = [];
    let topLevelCounter = 0;

    for (let line of lines) {
        // Determine indentation level
        const indentMatch = line.match(/^(\t+|\s+)/);
        let indentLevel = 0;
        if (indentMatch) {
            const indent = indentMatch[1];
            // For simplicity, consider each tab or 4 spaces as one indent level
            const tabCount = (indent.match(/\t/g) || []).length;
            const spaceCount = (indent.match(/ /g) || []).length;
            indentLevel = tabCount + Math.floor(spaceCount / 4);
            // Remove leading indentation
            line = line.substring(indent.length);
        }

        // Now line has no leading indentation

        // Handle headings
        if (line.startsWith('# ')) {
            line = line.replace(/^# (.*)$/, '【 $1 】');
            outputLines.push(line);
            continue;
        } else if (line.startsWith('## ')) {
            line = line.replace(/^## (.*)$/, '▋$1');
            outputLines.push(line);
            continue;
        }

        // Check for list items
        let listItemMatch;
        let isListItem = false;
        let bullet = '';
        let content = '';
        let listType = '';

        if ((listItemMatch = line.match(/^- \[ \] (.*)/))) {
            // Unchecked task
            bullet = '🟩 ';
            content = listItemMatch[1];
            isListItem = true;
            listType = 'task';
        } else if ((listItemMatch = line.match(/^- \[x\] (.*)/))) {
            // Checked task
            bullet = '✅ ';
            content = listItemMatch[1];
            isListItem = true;
            listType = 'task';
        } else if ((listItemMatch = line.match(/^\d+\.\s+(.*)/))) {
            // Ordered list item
            bullet = ''; // numbering will be generated
            content = listItemMatch[1];
            isListItem = true;
            listType = 'ordered';
        } else if ((listItemMatch = line.match(/^- (.*)/))) {
            // Unordered list item
            bullet = ''; // numbering will be generated
            content = listItemMatch[1];
            isListItem = true;
            listType = 'unordered';
        }

        if (isListItem) {
            // 处理顶级列表项
            if (indentLevel === 0) {
                topLevelCounter++;
                listCounters = [topLevelCounter];
                prevIndentLevel = 0;
            } else {
                // 处理子列表项
                // 确保 listCounters 数组长度与当前缩进级别匹配
                while (listCounters.length <= indentLevel) {
                    listCounters.push(0);
                }
                
                // 如果缩进级别改变，调整计数器
                if (indentLevel !== prevIndentLevel) {
                    // 如果缩进更深，添加新的计数器
                    if (indentLevel > prevIndentLevel) {
                        listCounters[indentLevel] = 0;
                    } else {
                        // 如果缩进更浅，截断数组
                        listCounters = listCounters.slice(0, indentLevel + 1);
                    }
                }
                
                // 增加当前级别的计数
                listCounters[indentLevel]++;
            }

            // 生成编号
            let numbering = listCounters.slice(0, indentLevel + 1).join('.');

            // Apply formatting to content
            content = applyFormatting(content);

            if (bullet === '🟩 ' || bullet === '✅ ') {
                // For top-level tasks, include bullet before numbering
                numbering = bullet + numbering + '. ' + content;
            } else {
                numbering = numbering + '. ' + content;
            }

            // Add to output
            outputLines.push(numbering);

            prevIndentLevel = indentLevel;
            continue;
        } else {
            // Not a list item

            // Reset listCounters and prevIndentLevel if necessary
            listCounters = [];
            prevIndentLevel = 0;

            // Apply formatting replacements to the line
            line = applyFormatting(line);

            outputLines.push(line);
        }
    }

    return outputLines.join('\n');
}

function applyFormatting(text: string): string {
    // Define the patterns and their replacements in order
    const patterns = [
        { regex: /\*\*(.*?)\*\*/, replacement: ' *$1* ' }, // bold
        { regex: /(?<!\*)\*(?!\*)(.*?)\*(?!\*)/, replacement: ' _$1_ ' }, // italic
        { regex: /~~(.*?)~~/, replacement: ' ~$1~ ' }, // strike
        { regex: /==(.*?)==/, replacement: ' `$1` ' }, // emphasize
        { regex: /`(.*?)`/, replacement: ' {$1} ' }, // quote
    ];

    let result = '';
    let remainingText = text;

    while (remainingText.length > 0) {
        let earliestMatch:
            | { pattern: any; match: RegExpExecArray; index: number }
            | null = null;
        let earliestIndex = remainingText.length;

        // Find the earliest match among the patterns
        for (let pattern of patterns) {
            pattern.regex.lastIndex = 0; // Reset regex index
            let match = pattern.regex.exec(remainingText);
            if (match && match.index < earliestIndex) {
                earliestMatch = {
                    pattern: pattern,
                    match: match,
                    index: match.index,
                };
                earliestIndex = match.index;
            }
        }

        if (earliestMatch) {
            // Append text before the match
            result += remainingText.slice(0, earliestMatch.index);

            // Apply the replacement
            let replacedText = earliestMatch.match[0].replace(
                earliestMatch.pattern.regex,
                earliestMatch.pattern.replacement
            );

            result += replacedText;

            // Update remainingText
            remainingText = remainingText.slice(
                earliestMatch.index + earliestMatch.match[0].length
            );
        } else {
            // No more matches, append the rest of the text
            result += remainingText;
            break;
        }
    }

    return result;
}
