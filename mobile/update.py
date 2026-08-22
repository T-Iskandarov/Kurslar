import re

with open('app/(auth)/register.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''        {/* Tug\\'ilgan sana */}
        <Text style={styles.label}>Tug\\'ilgan sana (YYYY-MM-DD)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="2000-12-31"
            placeholderTextColor={COLORS.textLight}
          />
          <Calendar color={COLORS.textLight} size={20} />
        </View>'''

replacement = '''        {/* Tug\\'ilgan sana */}
        <Text style={styles.label}>Tug\\'ilgan sana (YYYY-MM-DD)</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
          <Text style={[styles.input, { paddingTop: 16 }, !birthDate && { color: COLORS.textLight }]}>
            {birthDate || '2000-12-31'}
          </Text>
          <Calendar color={COLORS.textLight} size={20} />
        </TouchableOpacity>

        {showDatePicker && (
          <View style={{ backgroundColor: COLORS.white, borderRadius: SIZES.radius, overflow: 'hidden', marginBottom: 20 }}>
            <DateTimePicker
              value={dateObj}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              themeVariant="light"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (Platform.OS !== 'ios') {
                  setShowDatePicker(false);
                }
                if (selectedDate) {
                  setDateObj(selectedDate);
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const day = String(selectedDate.getDate()).padStart(2, '0');
                  setBirthDate( + '${year}--' + );
                }
              }}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity 
                style={{ backgroundColor: COLORS.primary, padding: 12, alignItems: 'center' }}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Tanlash</Text>
              </TouchableOpacity>
            )}
          </View>
        )}'''

content = content.replace(target, replacement)

with open('app/(auth)/register.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated")
