<?php
/**
 * Plugin Name:  Intervention Headless Setup
 * Plugin URI:   https://intervention.com
 * Description:  Registers the detail_page CPT and all ACF field groups required for the headless Next.js migration. Requires ACF PRO.
 * Version:      1.4.0
 * Author:       Intervention.com
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ---------------------------------------------------------------------------
// 1. Register the detail_page Custom Post Type
// ---------------------------------------------------------------------------
add_action( 'init', function () {
    register_post_type( 'detail_page', [
        'label'        => 'Detail Pages',
        'labels'       => [
            'name'          => 'Detail Pages',
            'singular_name' => 'Detail Page',
            'add_new_item'  => 'Add New Detail Page',
            'edit_item'     => 'Edit Detail Page',
        ],
        'public'       => false,
        'show_ui'      => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'rest_base'    => 'detail_page',
        'has_archive'  => false,
        'supports'     => [ 'title', 'custom-fields' ],
        'rewrite'      => false,
    ] );
} );

// ---------------------------------------------------------------------------
// 2. Register ACF Options Page
// ---------------------------------------------------------------------------
add_action( 'acf/init', function () {
    if ( function_exists( 'acf_add_options_page' ) ) {
        acf_add_options_page( [
            'page_title' => 'Global Settings',
            'menu_title' => 'Global Settings',
            'menu_slug'  => 'global-settings',
            'capability' => 'manage_options',
            'redirect'   => false,
        ] );
    }
} );

// ---------------------------------------------------------------------------
// 3. Import ACF Field Groups into the database (runs once on admin load)
//    Uses acf_import_field_group() which writes to the DB like the ACF UI does.
// ---------------------------------------------------------------------------
add_action( 'admin_init', function () {
    if ( ! function_exists( 'acf_import_field_group' ) ) return;
    if ( get_option( 'ihs_field_groups_v140_imported' ) ) return;

    // -----------------------------------------------------------------------
    // Group 1: Section Page — applied to all WP Pages
    // -----------------------------------------------------------------------
    acf_import_field_group( [
        'key'         => 'group_ihs_section_page',
        'title'       => 'Section Page',
        'active'      => true,
        'show_in_rest' => 1,
        'fields'   => [
            [ 'key' => 'field_sp_label',            'name' => 'label',            'label' => 'Label (nav / card text)',    'type' => 'text' ],
            [ 'key' => 'field_sp_title',            'name' => 'title',            'label' => 'Title (H1)',                 'type' => 'text' ],
            [ 'key' => 'field_sp_summary',          'name' => 'summary',          'label' => 'Summary (meta description)', 'type' => 'textarea' ],
            [ 'key' => 'field_sp_intro',            'name' => 'intro',            'label' => 'Intro paragraph',            'type' => 'textarea' ],
            [
                'key'           => 'field_sp_image',
                'name'          => 'image',
                'label'         => 'Hero Image',
                'type'          => 'image',
                'return_format' => 'url',
                'preview_size'  => 'medium',
            ],
            [ 'key' => 'field_sp_children_eyebrow', 'name' => 'childrenEyebrow', 'label' => 'Children Eyebrow', 'type' => 'text' ],
            [ 'key' => 'field_sp_children_title',   'name' => 'childrenTitle',   'label' => 'Children Title',   'type' => 'text' ],
            [
                'key'          => 'field_sp_content_blocks',
                'name'         => 'content_blocks',
                'label'        => 'Content Blocks',
                'type'         => 'flexible_content',
                'button_label' => 'Add Block',
                'layouts'      => [
                    [
                        'key'        => 'layout_sp_body_block',
                        'name'       => 'body_block',
                        'label'      => 'Body Block',
                        'sub_fields' => [
                            [ 'key' => 'field_sp_bb_heading', 'name' => 'heading', 'label' => 'Heading', 'type' => 'text' ],
                            [ 'key' => 'field_sp_bb_body',    'name' => 'body',    'label' => 'Body',    'type' => 'textarea', 'instructions' => 'Newline = new paragraph.' ],
                        ],
                    ],
                    [
                        'key'        => 'layout_sp_bullets_block',
                        'name'       => 'bullets_block',
                        'label'      => 'Bullets Block',
                        'sub_fields' => [
                            [ 'key' => 'field_sp_bub_heading', 'name' => 'heading', 'label' => 'Heading',                    'type' => 'text' ],
                            [ 'key' => 'field_sp_bub_body',    'name' => 'body',    'label' => 'Intro paragraph (optional)', 'type' => 'textarea' ],
                            [
                                'key'          => 'field_sp_bub_bullets',
                                'name'         => 'bullets',
                                'label'        => 'Bullets',
                                'type'         => 'repeater',
                                'button_label' => 'Add Bullet',
                                'sub_fields'   => [
                                    [ 'key' => 'field_sp_bub_item', 'name' => 'item', 'label' => 'Item', 'type' => 'text' ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'key'        => 'layout_sp_stats_block',
                        'name'       => 'stats_block',
                        'label'      => 'Stats Block',
                        'sub_fields' => [
                            [ 'key' => 'field_sp_stb_heading', 'name' => 'heading', 'label' => 'Heading', 'type' => 'text' ],
                            [ 'key' => 'field_sp_stb_body',    'name' => 'body',    'label' => 'Intro paragraph (optional)', 'type' => 'textarea' ],
                            [
                                'key'          => 'field_sp_stb_stats',
                                'name'         => 'stats',
                                'label'        => 'Stats',
                                'type'         => 'repeater',
                                'button_label' => 'Add Stat',
                                'sub_fields'   => [
                                    [ 'key' => 'field_sp_stb_value', 'name' => 'value', 'label' => 'Value', 'type' => 'text' ],
                                    [ 'key' => 'field_sp_stb_label', 'name' => 'label', 'label' => 'Label', 'type' => 'text' ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'key'        => 'layout_sp_features_block',
                        'name'       => 'features_block',
                        'label'      => 'Features Block',
                        'sub_fields' => [
                            [ 'key' => 'field_sp_fb_heading', 'name' => 'heading', 'label' => 'Heading', 'type' => 'text' ],
                            [ 'key' => 'field_sp_fb_body',    'name' => 'body',    'label' => 'Intro paragraph (optional)', 'type' => 'textarea' ],
                            [
                                'key'          => 'field_sp_fb_features',
                                'name'         => 'features',
                                'label'        => 'Features',
                                'type'         => 'repeater',
                                'button_label' => 'Add Feature',
                                'sub_fields'   => [
                                    [ 'key' => 'field_sp_fb_feat_title', 'name' => 'title', 'label' => 'Title', 'type' => 'text' ],
                                    [ 'key' => 'field_sp_fb_feat_body',  'name' => 'body',  'label' => 'Body',  'type' => 'textarea' ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'key'        => 'layout_sp_steps_block',
                        'name'       => 'steps_block',
                        'label'      => 'Steps Block',
                        'sub_fields' => [
                            [ 'key' => 'field_sp_sb_heading', 'name' => 'heading', 'label' => 'Heading', 'type' => 'text' ],
                            [ 'key' => 'field_sp_sb_body',    'name' => 'body',    'label' => 'Intro paragraph (optional)', 'type' => 'textarea' ],
                            [
                                'key'          => 'field_sp_sb_steps',
                                'name'         => 'steps',
                                'label'        => 'Steps',
                                'type'         => 'repeater',
                                'button_label' => 'Add Step',
                                'sub_fields'   => [
                                    [ 'key' => 'field_sp_sb_step_title', 'name' => 'title', 'label' => 'Title', 'type' => 'text' ],
                                    [ 'key' => 'field_sp_sb_step_body',  'name' => 'body',  'label' => 'Body',  'type' => 'textarea' ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'key'          => 'field_sp_faq',
                'name'         => 'faq',
                'label'        => 'FAQ',
                'type'         => 'repeater',
                'button_label' => 'Add FAQ Item',
                'sub_fields'   => [
                    [ 'key' => 'field_sp_faq_q', 'name' => 'q', 'label' => 'Question', 'type' => 'text' ],
                    [ 'key' => 'field_sp_faq_a', 'name' => 'a', 'label' => 'Answer',   'type' => 'textarea' ],
                ],
            ],
        ],
        'location' => [
            [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'page' ] ],
        ],
    ] );

    // -----------------------------------------------------------------------
    // Group 2: Detail Page — applied to detail_page CPT
    // -----------------------------------------------------------------------
    acf_import_field_group( [
        'key'          => 'group_ihs_detail_page',
        'title'        => 'Detail Page',
        'active'       => true,
        'show_in_rest' => 1,
        'fields' => [
            [
                'key'          => 'field_dp_slug',
                'name'         => 'slug',
                'label'        => 'Slug (URL)',
                'type'         => 'text',
                'instructions' => 'e.g. alcohol-intervention — must match the URL exactly.',
            ],
            [
                'key'           => 'field_dp_parent_section',
                'name'          => 'parent_section',
                'label'         => 'Parent Section',
                'type'          => 'select',
                'choices'       => [ 'intervention' => 'Intervention', 'services' => 'Services', 'resources' => 'Resources' ],
                'allow_null'    => false,
                'default_value' => 'intervention',
            ],
            [ 'key' => 'field_dp_label',   'name' => 'label',   'label' => 'Label (nav / card text)',    'type' => 'text' ],
            [ 'key' => 'field_dp_title',   'name' => 'title',   'label' => 'Title (H1)',                 'type' => 'text' ],
            [ 'key' => 'field_dp_summary', 'name' => 'summary', 'label' => 'Summary (meta description)', 'type' => 'textarea' ],
            [ 'key' => 'field_dp_intro',   'name' => 'intro',   'label' => 'Intro paragraph',            'type' => 'textarea' ],
            [
                'key'           => 'field_dp_image',
                'name'          => 'image',
                'label'         => 'Hero Image',
                'type'          => 'image',
                'return_format' => 'url',
                'preview_size'  => 'medium',
            ],
            [
                'key'          => 'field_dp_content_blocks',
                'name'         => 'content_blocks',
                'label'        => 'Content Blocks',
                'type'         => 'flexible_content',
                'button_label' => 'Add Block',
                'layouts'      => [
                    [
                        'key'        => 'layout_dp_body_block',
                        'name'       => 'body_block',
                        'label'      => 'Body Block',
                        'sub_fields' => [
                            [ 'key' => 'field_dp_bb_heading', 'name' => 'heading', 'label' => 'Heading', 'type' => 'text' ],
                            [ 'key' => 'field_dp_bb_body',    'name' => 'body',    'label' => 'Body',    'type' => 'textarea', 'instructions' => 'Newline = new paragraph.' ],
                        ],
                    ],
                    [
                        'key'        => 'layout_dp_bullets_block',
                        'name'       => 'bullets_block',
                        'label'      => 'Bullets Block',
                        'sub_fields' => [
                            [ 'key' => 'field_dp_bub_heading', 'name' => 'heading', 'label' => 'Heading',                    'type' => 'text' ],
                            [ 'key' => 'field_dp_bub_body',    'name' => 'body',    'label' => 'Intro paragraph (optional)', 'type' => 'textarea' ],
                            [
                                'key'          => 'field_dp_bub_bullets',
                                'name'         => 'bullets',
                                'label'        => 'Bullets',
                                'type'         => 'repeater',
                                'button_label' => 'Add Bullet',
                                'sub_fields'   => [
                                    [ 'key' => 'field_dp_bub_item', 'name' => 'item', 'label' => 'Item', 'type' => 'text' ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'key'        => 'layout_dp_stats_block',
                        'name'       => 'stats_block',
                        'label'      => 'Stats Block',
                        'sub_fields' => [
                            [ 'key' => 'field_dp_stb_heading', 'name' => 'heading', 'label' => 'Heading', 'type' => 'text' ],
                            [ 'key' => 'field_dp_stb_body',    'name' => 'body',    'label' => 'Intro paragraph (optional)', 'type' => 'textarea' ],
                            [
                                'key'          => 'field_dp_stb_stats',
                                'name'         => 'stats',
                                'label'        => 'Stats',
                                'type'         => 'repeater',
                                'button_label' => 'Add Stat',
                                'sub_fields'   => [
                                    [ 'key' => 'field_dp_stb_value', 'name' => 'value', 'label' => 'Value', 'type' => 'text' ],
                                    [ 'key' => 'field_dp_stb_label', 'name' => 'label', 'label' => 'Label', 'type' => 'text' ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'key'        => 'layout_dp_features_block',
                        'name'       => 'features_block',
                        'label'      => 'Features Block',
                        'sub_fields' => [
                            [ 'key' => 'field_dp_fb_heading', 'name' => 'heading', 'label' => 'Heading', 'type' => 'text' ],
                            [ 'key' => 'field_dp_fb_body',    'name' => 'body',    'label' => 'Intro paragraph (optional)', 'type' => 'textarea' ],
                            [
                                'key'          => 'field_dp_fb_features',
                                'name'         => 'features',
                                'label'        => 'Features',
                                'type'         => 'repeater',
                                'button_label' => 'Add Feature',
                                'sub_fields'   => [
                                    [ 'key' => 'field_dp_fb_feat_title', 'name' => 'title', 'label' => 'Title', 'type' => 'text' ],
                                    [ 'key' => 'field_dp_fb_feat_body',  'name' => 'body',  'label' => 'Body',  'type' => 'textarea' ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'key'        => 'layout_dp_steps_block',
                        'name'       => 'steps_block',
                        'label'      => 'Steps Block',
                        'sub_fields' => [
                            [ 'key' => 'field_dp_sb_heading', 'name' => 'heading', 'label' => 'Heading', 'type' => 'text' ],
                            [ 'key' => 'field_dp_sb_body',    'name' => 'body',    'label' => 'Intro paragraph (optional)', 'type' => 'textarea' ],
                            [
                                'key'          => 'field_dp_sb_steps',
                                'name'         => 'steps',
                                'label'        => 'Steps',
                                'type'         => 'repeater',
                                'button_label' => 'Add Step',
                                'sub_fields'   => [
                                    [ 'key' => 'field_dp_sb_step_title', 'name' => 'title', 'label' => 'Title', 'type' => 'text' ],
                                    [ 'key' => 'field_dp_sb_step_body',  'name' => 'body',  'label' => 'Body',  'type' => 'textarea' ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'key'          => 'field_dp_faq',
                'name'         => 'faq',
                'label'        => 'FAQ',
                'type'         => 'repeater',
                'button_label' => 'Add FAQ Item',
                'sub_fields'   => [
                    [ 'key' => 'field_dp_faq_q', 'name' => 'q', 'label' => 'Question', 'type' => 'text' ],
                    [ 'key' => 'field_dp_faq_a', 'name' => 'a', 'label' => 'Answer',   'type' => 'textarea' ],
                ],
            ],
        ],
        'location' => [
            [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'detail_page' ] ],
        ],
    ] );

    // -----------------------------------------------------------------------
    // Group 3: Global Settings — applied to the Global Settings options page
    // -----------------------------------------------------------------------
    acf_import_field_group( [
        'key'          => 'group_ihs_global_settings',
        'title'        => 'Global Settings',
        'active'       => true,
        'show_in_rest' => 1,
        'fields' => [
            [ 'key' => 'field_gs_phone_display', 'name' => 'phone_display', 'label' => 'Phone (display)', 'type' => 'text',  'placeholder' => '(800) 789-1605' ],
            [ 'key' => 'field_gs_phone_href',    'name' => 'phone_href',    'label' => 'Phone (href)',    'type' => 'text',  'placeholder' => 'tel:+18007891605' ],
            [ 'key' => 'field_gs_email',         'name' => 'email',         'label' => 'Email',           'type' => 'email', 'placeholder' => 'help@intervention.com' ],
        ],
        'location' => [
            [ [ 'param' => 'options_page', 'operator' => '==', 'value' => 'global-settings' ] ],
        ],
    ] );

    update_option( 'ihs_field_groups_v140_imported', true );
} );
