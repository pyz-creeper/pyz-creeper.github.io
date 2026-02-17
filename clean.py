import os
import re
import yaml

# ================= 配置区 =================
TARGET_DIR = './content/publications/'
WRITE_CHANGES = True 
# ==========================================

def clean_author_name(name):
    """移除 HTML 标签并修剪空格"""
    clean_name = re.sub(r'<[^>]+>', '', name)
    return clean_name.strip()

def process_md_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 使用正则匹配 YAML Front Matter
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)
    if not match:
        return

    front_matter_str = match.group(1)
    body = match.group(2)

    try:
        data = yaml.safe_load(front_matter_str)
    except yaml.YAMLError as e:
        print(f"解析错误 {file_path}: {e}")
        return

    updated = False

    # 1. 处理作者 (保持原有逻辑)
    if 'authors' in data:
        original_authors = data['authors']
        if isinstance(original_authors, str):
            data['authors'] = [clean_author_name(a) for a in original_authors.split(',')]
            updated = True
        elif isinstance(original_authors, list):
            new_authors = [clean_author_name(str(a)) for a in original_authors]
            if new_authors != original_authors:
                data['authors'] = new_authors
                updated = True

    # 2. 处理 year -> date
    # 格式化为 'YYYY-01-01T00:00:00Z'
    if 'year' in data:
        year_val = str(data['year']).strip()
        # 仅当 year 是纯数字年份时处理
        if re.match(r'^\d{4}$', year_val):
            data['date'] = f"{year_val}-01-01T00:00:00Z"
            # 移除旧的 year 字段以保持 Front Matter 整洁
            del data['year']
            updated = True

    # 3. 处理 excerpt -> publication
    if 'excerpt' in data:
        data['publication'] = data['excerpt']
        del data['excerpt']
        updated = True

    # 4. 处理 conference -> publication_short
    if 'conference' in data:
        data['publication_short'] = data['conference']
        del data['conference']
        updated = True

    # 保存修改
    if updated:
        # 使用 sort_keys=False 尽可能保持原有字段顺序
        new_front_matter = yaml.dump(data, sort_keys=False, allow_unicode=True)
        new_content = f"---\n{new_front_matter}---\n{body}"

        if WRITE_CHANGES:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ 已更新: {file_path}")
        else:
            print(f"🔍 预览修改: {file_path}")

def main():
    if not os.path.exists(TARGET_DIR):
        print(f"错误: 找不到目录 {TARGET_DIR}")
        return

    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith('.md'):
                process_md_file(os.path.join(root, file))

if __name__ == "__main__":
    main()