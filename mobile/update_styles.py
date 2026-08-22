import re

with open('app/(tabs)/my-courses.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"emptyText: \{[^}]+\}"
replacement = """emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  }"""
content = re.sub(pattern, replacement, content)

with open('app/(tabs)/my-courses.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('app/(tabs)/certificates.tsx', 'r', encoding='utf-8') as f:
    content2 = f.read()

content2 = re.sub(pattern, replacement, content2)

with open('app/(tabs)/certificates.tsx', 'w', encoding='utf-8') as f:
    f.write(content2)

print("Styles updated")
