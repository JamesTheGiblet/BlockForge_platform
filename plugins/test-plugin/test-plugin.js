class TestPlugin {
  constructor() {
    this.name = 'Test Plugin';
  }

  init() {
    console.log('✅ Test Plugin initialized!');
    console.log('Plugin loader is working correctly.');
  }

  render() {
    console.log('🎨 Test Plugin render() called');
  }

  export(format) {
    console.log('📥 Test Plugin export() called with format:', format);
  }
}

export default TestPlugin;