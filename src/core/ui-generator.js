/**
 * UI Generator
 * Dynamically creates UI controls from plugin manifests
 */
export class UIGenerator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  generate(plugin) {
    if (!plugin.ui || !plugin.ui.tools) return;

    const wrapper = document.createElement('div');
    wrapper.id = `${plugin.id}-controls`;
    wrapper.className = 'controls plugin-controls';
    
    // Add tools
    plugin.ui.tools.forEach(tool => {
      const group = document.createElement('div');
      group.style.display = 'flex';
      group.style.alignItems = 'center';
      group.style.marginRight = '10px';

      // Label
      if (tool.label) {
        const label = document.createElement('label');
        label.htmlFor = tool.id;
        label.textContent = tool.label + ':';
        label.style.fontSize = '0.95em';
        label.style.marginRight = '5px';
        group.appendChild(label);
      }

      // Input
      const input = this.createInput(tool);
      group.appendChild(input);
      wrapper.appendChild(group);
    });

    this.container.appendChild(wrapper);
  }

  createInput(tool) {
    let input;

    switch (tool.type) {
      case 'select':
        input = document.createElement('select');
        input.id = tool.id;
        input.style.padding = '8px';
        if (tool.options) {
          tool.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === tool.default) option.selected = true;
            input.appendChild(option);
          });
        }
        break;

      case 'range':
        input = document.createElement('input');
        input.type = 'range';
        input.id = tool.id;
        if (tool.min) input.min = tool.min;
        if (tool.max) input.max = tool.max;
        if (tool.value) input.value = tool.value;
        if (tool.default) input.value = tool.default;
        input.style.width = '100px';
        break;

      case 'file':
        input = document.createElement('input');
        input.type = 'file';
        input.id = tool.id;
        if (tool.accept) input.accept = tool.accept;
        input.style.padding = '8px';
        break;

      case 'checkbox':
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = tool.id;
        if (tool.default) input.checked = tool.default;
        break;

      case 'date':
        input = document.createElement('input');
        input.type = 'date';
        input.id = tool.id;
        if (tool.default) input.value = tool.default;
        input.style.padding = '8px';
        break;

      case 'text':
      default:
        input = document.createElement('input');
        input.type = 'text';
        input.id = tool.id;
        if (tool.placeholder) input.placeholder = tool.placeholder;
        if (tool.value) input.value = tool.value;
        if (tool.default) input.value = tool.default;
        input.style.padding = '8px';
        break;
    }

    if (tool.title) input.title = tool.title;
    return input;
  }
}