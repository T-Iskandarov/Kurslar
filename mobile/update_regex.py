import re

with open('app/(auth)/register.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'\{showDatePicker && \(\s*<View.*?DateTimePicker.*?</View>\s*\)\}', re.DOTALL)

new_picker = '''<Modal visible={showDatePicker} transparent animationType="fade">
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
            <TouchableOpacity style={{ backgroundColor: 'white', padding: 20, borderRadius: 20, width: '90%' }} activeOpacity={1}>
              <DateTimePicker
                mode="single"
                date={dateObj}
                maxDate={new Date()}
                onChange={(params) => {
                  if (params.date) {
                    const d = dayjs(params.date).toDate();
                    setDateObj(d);
                    setBirthDate(dayjs(d).format('YYYY-MM-DD'));
                    setShowDatePicker(false);
                  }
                }}
                selectedItemColor={COLORS.primary}
              />
              <TouchableOpacity 
                style={{ backgroundColor: COLORS.primary, padding: 12, alignItems: 'center', borderRadius: 8, marginTop: 10 }}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Yopish</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>'''

content = pattern.sub(new_picker, content)

with open('app/(auth)/register.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated via regex")
